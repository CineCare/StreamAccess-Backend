import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from '../movies.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaModule } from '../../prisma/prisma.module';
import { MoviesController } from '../movies.controller';
import { handleErrorResponse } from '../../commons/utils/handleErrorResponse';

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

  describe('MoviesService - create', () => {
    let service: MoviesService;
    let prismaService: PrismaService;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MoviesService,
          {
            provide: PrismaService,
            useValue: {
              movie: {
                create: jest.fn(),
              },
            },
          },
        ],
      }).compile();

      service = module.get<MoviesService>(MoviesService);
      prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should create a movie', async () => {
      const createMovieDTO = {
        title: 'Test Movie',
        releaseYear: '2023',
        producerId: '1',
        directorId: '1',
      };

      const createdMovie = {
        id: 1,
        ...createMovieDTO,
        releaseYear: 2023,
        producerId: 1,
        directorId: 1,
        image: 'default.jpg',
        shortSynopsis: 'Short synopsis',
        longSynopsis: 'Long synopsis',
        teamComment: 'Team comment',
      };

      jest.spyOn(prismaService.movie, 'create').mockResolvedValue(createdMovie);

      const result = await service.create(createMovieDTO);

      expect(prismaService.movie.create).toHaveBeenCalledWith({
        data: {
          ...createMovieDTO,
          releaseYear: 2023,
          producerId: 1,
          directorId: 1,
        },
      });
      expect(result).toEqual(createdMovie);
    });

    it('should handle error response', async () => {
      const createMovieDTO = {
        title: 'Test Movie',
        releaseYear: '2023',
        producerId: '1',
        directorId: '1',
      };

      const error = new Error('Test Error');
      jest.spyOn(prismaService.movie, 'create').mockRejectedValue(error);
      jest
        .spyOn(
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          require('../../commons/utils/handleErrorResponse'),
          'handleErrorResponse',
        )
        .mockImplementation(() => {});

      await service.create(createMovieDTO);

      expect(handleErrorResponse).toHaveBeenCalledWith(
        error,
        'Le film',
        createMovieDTO.title,
      );
    });
  });
});
