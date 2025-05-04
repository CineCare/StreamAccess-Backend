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
import { PrefTypeDTO } from './DTO/prefType.dto';
import { checkPrefs } from './prefs/checkPrefs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getList() {
    return await this.prisma.user.findMany({
      select: { id: true, pseudo: true },
      where: { isActive: true },
    });
  }

  async getOne(id: number, additionnalFields?: object): Promise<UserEntity> {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { id: id },
        select: {
          id: true,
          pseudo: true,
          isActive: true,
          prefs: {
            select: {
              name: true,
              value: true,
            },
          },
          ...additionnalFields,
        },
      });
    } catch (e) {
      handleErrorResponse(e, 'movieId', id.toString());
    }
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
  ): Promise<UserEntity & { errors: string[] }> {
    const newData: UpdateUserEntity = {};
    const prefErrors = [];
    if (data.actualPassword) {
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
    if (data.pseudo) {
      newData.pseudo = data.pseudo;
    }
    // Check if prefs are provided
    //TODO : refactor to use in /auth/register
    if (data.prefs) {
      // console.log(`prefs provided :`, data.prefs);
      // for (const pref of data.prefs) {
      //   const existingPrefType = await this.prisma.prefType.findFirst({
      //     where: { prefName: pref.name },
      //   });
      //   console.log('existingPrefType :', existingPrefType);
      //   if (!existingPrefType) {
      //     errors.push(`Preference ${pref.name} does not exist.`);
      //     continue;
      //   }
      //   if (
      //     existingPrefType.dataType != 'enum' &&
      //     existingPrefType.dataType !== typeof pref.value
      //   ) {
      //     errors.push(
      //       `Preference ${pref.name} has type ${existingPrefType.dataType} but you provided ${typeof pref.value}.`,
      //     );
      //     continue;
      //   }
      //   if (existingPrefType.dataType === 'enum') {
      //     if (!prefEnums[existingPrefType.prefName].includes(pref.value)) {
      //       errors.push(
      //         `Preference ${pref.name} has invalid value ${pref.value}. Allowed values are: ${prefEnums[
      //           existingPrefType.prefName
      //         ].join(', ')}`,
      //       );
      //       continue;
      //     }
      //   }
      // }
      const { valid, errors } = await checkPrefs(data.prefs, this.prisma);
      if (errors.length > 0) {
        prefErrors.push(...errors);
      }
      console.log('valid prefs :', valid);
      console.log('errors prefs :', errors);
      // register valid prefs
      const prefData = [];
      for (const pref of valid) {
        prefData.push({
          name: pref,
          value: data.prefs.find((p) => p.name === pref).value,
          userId: id,
        });
      }
      await this.prisma.prefs.createMany({
        data: prefData,
        skipDuplicates: true,
      });
    }
    const newUser = await this.prisma.user.update({
      where: { id },
      data: newData,
    });
    return {
      id: newUser.id,
      pseudo: newUser.pseudo,
      email: newUser.email,
      errors: prefErrors,
    };
  }

  async addPrefType(body: PrefTypeDTO) {
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
