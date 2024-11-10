import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDTO } from './DTO/movieCreate.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async getList() {
    return await this.prisma.movie.findMany();
  }

  async create(body: CreateMovieDTO) {
    return await this.prisma.movie.create({data: body});
  }
}
