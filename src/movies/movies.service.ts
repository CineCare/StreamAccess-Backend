import { Injectable } from '@nestjs/common';
import { handleErrorResponse } from 'src/commons/utils/handleErrorResponse';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDTO } from './DTO/movieCreate.dto';
import { UpdateMovieDTO } from './DTO/movieUpdate.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async getList() {
    return await this.prisma.movie.findMany();
  }

  async getOne(id: number) {
    try {
      return await this.prisma.movie.findUniqueOrThrow({where: {id}});
    }
    catch (e) {
      handleErrorResponse(e, 'movieId', id.toString());
    }
    
  }

  async create(body: CreateMovieDTO) {
    return await this.prisma.movie.create({data: body});
  }

  async update(id: number, body: UpdateMovieDTO) {
    try {
      return await this.prisma.movie.update({where: {id}, data: body});
    }
    catch (e) {
      handleErrorResponse(e, 'movieId', id.toString());
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.movie.delete({where: {id}});
    }
    catch (e) {
      handleErrorResponse(e, 'movieId', id.toString());
    }
  }
}
