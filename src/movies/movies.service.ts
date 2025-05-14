import { Injectable, NotFoundException } from '@nestjs/common';
import { handleErrorResponse } from '../commons/utils/handleErrorResponse';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDTO, UpdateMovieDTO } from './DTO/movie.dto';
import { CreateMovieTagDTO } from './DTO/movieTagCreate.dto';
import { CreateProducerDTO } from './DTO/producerCreate.dto';
import { UpdateMovieEntity } from './entities/movieUpdate.entity';
import { castNumParam } from '../commons/utils/castNumParam';
import { CreateMovieEntity } from './entities/movieCreate.entity';
import { CreateDirectorDTO } from './DTO/directorCreate.dto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async getList() {
    const response = await this.prisma.movie.findMany({
      include: { tags: { select: { tag: { select: { id: true } } } } },
    });

    return response.map((cinema) => {
      return {
        ...cinema,
        tags: cinema.tags.map((movieTag) => movieTag.tag.id),
      };
    });
  }

  async getOne(id: number) {
    try {
      const movie = await this.prisma.movie.findUniqueOrThrow({
        where: { id },
        include: { tags: { select: { tag: { select: { id: true } } } } },
      });
      return {
        ...movie,
        tags: movie.tags.map((movieTag) => movieTag.tag.id),
      };
    } catch (e) {
      handleErrorResponse(e, 'movieId', id.toString());
    }
  }

  async create(body: CreateMovieDTO) {
    const entity: CreateMovieEntity = {
      ...body,
      releaseYear: castNumParam('releaseYear', body.releaseYear),
      producerId: body.producerId
        ? castNumParam('producerId', body.producerId)
        : undefined,
      directorId: body.directorId
        ? castNumParam('directorId', body.directorId)
        : undefined,
    };
    try {
      return await this.prisma.movie.create({ data: entity });
    } catch (e) {
      handleErrorResponse(e, 'Le film', body.title);
    }
  }

  async update(id: number, body: UpdateMovieDTO) {
    const entity: UpdateMovieEntity = {
      ...body,
      releaseYear: body.releaseYear
        ? castNumParam('releaseYear', body.releaseYear)
        : undefined,
      producerId: body.producerId
        ? castNumParam('producerId', body.producerId)
        : undefined,
      directorId: body.directorId
        ? castNumParam('directorId', body.directorId)
        : undefined,
    };
    if (body.image) {
      // Supprimer l'ancienne image si elle existe
      const oldMovie = await this.prisma.movie.findUnique({ where: { id } });
      if (oldMovie && oldMovie.image) {
        const oldImagePath = path.join(
          __dirname,
          '../../assets/movies_images',
          oldMovie.image,
        );
        try {
          fs.unlinkSync(oldImagePath);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error deleting old image:', err);
        }
      }
      entity.image = body.image;
    }
    try {
      return await this.prisma.movie.update({ where: { id }, data: entity });
    } catch (e) {
      handleErrorResponse(e, 'movieId', id.toString());
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.movie.delete({ where: { id } });
    } catch (e) {
      handleErrorResponse(e, 'movieId', id.toString());
    }
  }

  /**
   *
   ** tags
   *
   */

  async getTags() {
    return await this.prisma.movieTag.findMany();
  }

  async getMovieTags(id: number) {
    const result = await this.prisma.movieTagMovie.findMany({
      where: { movieId: id },
      select: { tag: true },
    });
    return result.map((elt) => elt.tag);
  }

  async createTag(body: CreateMovieTagDTO) {
    return await this.prisma.movieTag.create({ data: body });
  }

  async updateTag(id: number, body: CreateMovieTagDTO) {
    try {
      return await this.prisma.movieTag.update({ where: { id }, data: body });
    } catch (e) {
      handleErrorResponse(e, 'tag', id.toString());
    }
  }

  async deleteTag(id: number) {
    try {
      return await this.prisma.movieTag.delete({ where: { id } });
    } catch (e) {
      handleErrorResponse(e, 'tag', id.toString());
    }
  }

  async checkTagIds(body: number[]) {
    body = [...new Set(body)];
    const existing = await this.prisma.movieTag.count({
      where: { id: { in: body } },
    });
    if (existing !== body.length) {
      throw new NotFoundException(
        `Some tags do not exist in ${body.toString()}`,
        'Bad tags list',
      );
    }
    return body;
  }

  async addTags(id: number, body: number[]) {
    body = await this.checkTagIds(body);

    // Récupérer les id de tags liés au film en une seule requête
    const existingTags = (
      await this.prisma.movieTagMovie.findMany({
        where: { movieId: id, tagId: { in: body } },
        select: { tagId: true },
      })
    ).map((elt) => elt.tagId);

    // Filtrer les tags qui n'existent pas encore et préparer les data
    const data = body
      .filter((tagId) => !existingTags.includes(tagId))
      .map((tagId) => ({ movieId: id, tagId }));

    return {
      success: true,
      created: (await this.prisma.movieTagMovie.createMany({ data })).count,
    };
  }

  async deleteMovieTagMovieList(id: number, body: number[]) {
    await this.checkTagIds(body);
    return {
      success: true,
      deleted: (
        await this.prisma.movieTagMovie.deleteMany({
          where: { movieId: id, tagId: { in: body } },
        })
      ).count,
    };
  }

  /**
   *
   ** producers
   *
   */

  async createProducer(body: CreateProducerDTO) {
    return await this.prisma.producer.create({ data: body });
  }

  async getProducers() {
    return await this.prisma.producer.findMany();
  }

  async getProducer(id: number) {
    try {
      return await this.prisma.producer.findUniqueOrThrow({ where: { id } });
    } catch (e) {
      handleErrorResponse(e, 'producerId', id.toString());
    }
  }

  async updateProducer(id: number, body: CreateProducerDTO) {
    try {
      return await this.prisma.producer.update({ where: { id }, data: body });
    } catch (e) {
      handleErrorResponse(e, 'producerId', id.toString());
    }
  }

  async deleteProducer(id: number) {
    try {
      return await this.prisma.producer.delete({ where: { id } });
    } catch (e) {
      handleErrorResponse(e, 'producerId', id.toString());
    }
  }

  async getProducerMovies(id: number) {
    try {
      await this.prisma.producer.findUniqueOrThrow({ where: { id } });
    } catch (e) {
      handleErrorResponse(e, 'producerId', id.toString());
    }
    return await this.prisma.movie.findMany({ where: { producerId: id } });
  }

  /**
   *
   ** directors
   *
   */

  async createDirector(body: CreateDirectorDTO) {
    return await this.prisma.director.create({ data: body });
  }

  async getDirectors() {
    return await this.prisma.director.findMany();
  }

  async getDirector(id: number) {
    try {
      return await this.prisma.director.findUniqueOrThrow({ where: { id } });
    } catch (e) {
      handleErrorResponse(e, 'directorId', id.toString());
    }
  }

  async updateDirector(id: number, body: CreateDirectorDTO) {
    try {
      return await this.prisma.director.update({ where: { id }, data: body });
    } catch (e) {
      handleErrorResponse(e, 'directorId', id.toString());
    }
  }

  async deleteDirector(id: number) {
    try {
      return await this.prisma.director.delete({ where: { id } });
    } catch (e) {
      handleErrorResponse(e, 'directorId', id.toString());
    }
  }

  async getDirectorMovies(id: number) {
    try {
      await this.prisma.director.findUniqueOrThrow({ where: { id } });
    } catch (e) {
      handleErrorResponse(e, 'directorId', id.toString());
    }
    return await this.prisma.movie.findMany({ where: { directorId: id } });
  }
}
