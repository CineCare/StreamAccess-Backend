import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getList() {
    return await this.prisma.user.findMany({
      select: { id: true, pseudo: true },
    });
  }

  async getOne(id: number): Promise<UserEntity> {
    return await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select: { id: true, pseudo: true },
    });
  }
}
