import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MoviesService {
    constructor(private readonly prisma: PrismaService) {}

    async getList() {
        return await this.prisma.user.findMany({
          select: { id: true, pseudo: true },
          where: { isActive: true },
        });
      }
}
