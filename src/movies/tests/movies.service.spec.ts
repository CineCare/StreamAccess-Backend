import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from '../movies.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from '../../prisma/prisma.module';
import { MoviesController } from '../movies.controller';

describe('MoviesService', () => {
  let service: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [MoviesService],
      imports: [
        PrismaModule,
        MulterModule.register({
          dest: './assets/movies_images',
        }),
      ],
      exports: [MoviesService],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

describe('MoviesService - addTags', () => {
  let service: MoviesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: PrismaService,
          useValue: {
            movieTag: {
              count: jest.fn(),
            },
            movieTagMovie: {
              createMany: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should add tags to a movie', async () => {
    const movieId = 1;
    const movieTags = [{ id: 1 }, { id: 2 }, { id: 3 }];

    jest
      .spyOn(prismaService.movieTag, 'count')
      .mockResolvedValue(movieTags.length);
    jest
      .spyOn(prismaService.movieTagMovie, 'createMany')
      .mockResolvedValue({ count: movieTags.length });
    jest.spyOn(prismaService.movieTagMovie, 'findMany').mockResolvedValue([]);

    const result = await service.addTags(
      movieId,
      movieTags.map((e) => e.id),
    );

    expect(prismaService.movieTag.count).toHaveBeenCalledWith({
      where: { id: { in: movieTags.map((e) => e.id) } },
    });
    expect(prismaService.movieTagMovie.createMany).toHaveBeenCalledWith({
      data: movieTags.map((tagId) => ({ movieId, tagId: tagId.id })),
    });
    expect(result).toEqual({ success: true, created: movieTags.length });
  });

  it('should throw NotFoundException if some tags do not exist', async () => {
    const movieId = 1;
    const tagIds = [1, 2, 3];

    jest
      .spyOn(prismaService.movieTag, 'count')
      .mockResolvedValue(tagIds.length - 1);

    await expect(service.addTags(movieId, tagIds)).rejects.toThrow(
      NotFoundException,
    );
  });
});
