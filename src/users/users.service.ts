import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDTO } from './DTO/userUpdate.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserEntity } from './entities/updateUser.entity';
import { handleErrorResponse } from '../commons/utils/handleErrorResponse';
import * as prefHandler from '../commons/utils/prefsHandler';
import { MappedUserDTO } from './DTO/userMapped.dto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getList() {
    return await this.prisma.user.findMany({
      select: { id: true, pseudo: true },
      where: { isActive: true },
    });
  }

  async getOne(id: number, additionnalFields?: object): Promise<MappedUserDTO> {
    try {
      const user = (await this.prisma.user.findUniqueOrThrow({
        where: { id: id },
        select: {
          id: true,
          pseudo: true,
          avatar: true,
          isActive: true,
          ...additionnalFields,
        },
      })) as UserEntity;
      if (user.prefs) {
        await this.castUserPrefs(user);
      }
      const mappedUser = {
        ...user,
        prefs: user.prefs
          ? user.prefs.reduce(this.reducePrefs(), {})
          : undefined,
      };

      return mappedUser;
    } catch (e) {
      handleErrorResponse(e, 'userId', id.toString());
    }
  }

  private reducePrefs(): (
    previousValue: object,
    currentValue: prefHandler.PrefDTO,
    currentIndex: number,
    array: prefHandler.PrefDTO[],
  ) => object {
    return (acc, pref) => {
      if (!acc[pref.profileName]) {
        acc[pref.profileName] = {};
      }
      acc[pref.profileName][pref.name] = pref.value;

      return acc;
    };
  }

  async getCandidates() {
    return await this.prisma.user.findMany({
      select: { id: true, pseudo: true },
      where: { isActive: false },
    });
  }

  async updateMe(
    id: number,
    data: UpdateUserDTO,
  ): Promise<MappedUserDTO & { errors: string[] }> {
    const newData: UpdateUserEntity = {};
    if (data.actualPassword) {
      await this.managePassowordChange(id, data, newData);
    }
    if (data.pseudo) {
      newData.pseudo = data.pseudo;
    }
    if (data.avatar !== undefined) {
      // remove old avatar
      await this.manageAvatar(id, newData, data);
    }
    let prefErrors = [];
    if (data.prefs) {
      prefErrors = await this.handlePrefs(
        data.prefs as prefHandler.PrefDTO[],
        id,
      );
    }
    const newUser = (await this.prisma.user.update({
      where: { id },
      data: newData,
      include: {
        prefs: {
          select: {
            name: true,
            value: true,
            profileName: true,
          },
        },
      },
    })) as UserEntity;
    if (newUser.prefs) {
      await this.castUserPrefs(newUser);
    }

    const mappedUser = {
      ...newUser,
      prefs: newUser.prefs
        ? newUser.prefs.reduce(this.reducePrefs(), {})
        : undefined,
    };
    return {
      id: mappedUser.id,
      pseudo: mappedUser.pseudo,
      avatar: mappedUser.avatar,
      email: mappedUser.email,
      prefs: mappedUser.prefs,
      errors: prefErrors.length > 0 ? prefErrors : undefined,
    };
  }

  private async managePassowordChange(
    id: number,
    data: UpdateUserDTO,
    newData: UpdateUserEntity,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const compare = await bcrypt.compare(data.actualPassword, user.password);
    if (!compare) {
      throw new BadRequestException('Le mot de passe actuel est invalide');
    }
    if (!data.newPassword || !data.newPasswordConfirm) {
      throw new BadRequestException(
        'Pour changer de mot de passe, vous devez renseigner le nouveau mot de passe et le confirmer',
      );
    }
    if (data.newPassword !== data.newPasswordConfirm) {
      throw new BadRequestException(
        'Le nouveau mot de passe et la confirmation sont différents',
      );
    }
    newData.password = await bcrypt.hash(
      data.newPassword,
      parseInt(process.env.ROUNDS_OF_HASHING),
    );
  }

  private async manageAvatar(
    id: number,
    newData: UpdateUserEntity,
    data: UpdateUserDTO,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { avatar: true },
    });
    if (user.avatar) {
      const avatarPath = path.join(
        __dirname,
        '../../assets/user_avatars',
        user.avatar,
      );
      fs.unlink(avatarPath, (err) => {
        if (err) {
          // eslint-disable-next-line no-console
          console.error('Error deleting avatar file:', err);
          throw new BadRequestException('Failed to delete avatar file');
        }
      });
    }
    newData.avatar = data.avatar;
  }

  async castUserPrefs(newUser: UserEntity) {
    const prefTypes = await this.prisma.prefType.findMany({
      where: {
        prefName: { in: newUser.prefs.map((pref) => pref.name) },
      },
    });
    newUser.prefs = newUser.prefs.map((pref) => {
      if (
        prefTypes.find((p) => p.prefName === pref.name).dataType === 'boolean'
      ) {
        return {
          ...pref,
          value: pref.value === 'true' ? true : false,
        };
      }
      if (
        prefTypes.find((p) => p.prefName === pref.name).dataType === 'number'
      ) {
        return {
          ...pref,
          value: parseFloat(pref.value.toString()),
        };
      }
      return pref;
    });
  }

  async handlePrefs(prefs: prefHandler.PrefDTO[], id: number) {
    const prefErrors = [];
    const { valid, errors } = await prefHandler.checkPrefs(prefs, this.prisma);
    if (errors.length > 0) {
      prefErrors.push(...errors);
    }
    // check if pref is already in db
    const existingPrefs = await this.prisma.prefs.findMany({
      where: {
        AND: [
          { userId: id },
          { name: { in: valid.map((p) => p.name) } },
          { profileName: { in: valid.map((p) => p.profileName) } },
        ],
      },
    });
    // register valid prefs
    const prefData = [];
    for (const pref of valid) {
      // check if pref is in existing prefs
      const existing = existingPrefs.find(
        (p) => p.name === pref.name && p.profileName === pref.profileName,
      );
      if (!existing) {
        prefData.push({
          name: pref.name,
          value: prefs.find((p) => p.name === pref.name).value.toString(),
          profileName: pref.profileName,
          userId: id,
        });
      } else {
        // update existing pref
        await this.prisma.prefs.update({
          where: { id: existing.id },
          data: {
            value: prefs.find((p) => p.name === pref.name).value.toString(),
          },
        });
      }
    }
    await this.prisma.prefs.createMany({
      data: prefData,
    });
    return prefErrors;
  }

  async addPrefType(body: prefHandler.PrefTypeDTO) {
    const { prefName, dataType } = body;
    // Check if prefName already exists
    const existingPrefType = await this.prisma.prefType.findFirst({
      where: { prefName },
    });
    if (existingPrefType) {
      throw new BadRequestException(
        `Preference type with name ${prefName} already exists.`,
      );
    }

    // Check if type is legit
    const allowedTypes = ['string', 'number', 'boolean', 'enum'];
    if (!allowedTypes.includes(dataType)) {
      throw new BadRequestException(
        `Type ${dataType} is not allowed. Allowed types are: ${allowedTypes.join(
          ', ',
        )}`,
      );
    }

    const prefType = await this.prisma.prefType.create({
      data: {
        prefName,
        dataType,
      },
    });
    return prefType;
  }
}
