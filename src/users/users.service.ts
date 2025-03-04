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

//TODO set in .env
export const roundsOfHashing = 10;

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

  async updateMe(id: number, data: UpdateUserDTO): Promise<UserEntity> {
    const newData: UpdateUserEntity = {};
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
      newData.password = await bcrypt.hash(data.newPassword, roundsOfHashing);
    }
    if (data.pseudo) {
      newData.pseudo = data.pseudo;
    }
    const newUser = await this.prisma.user.update({
      where: { id },
      data: newData,
    });
    return { id: newUser.id, pseudo: newUser.pseudo, email: newUser.email };
  }
}
