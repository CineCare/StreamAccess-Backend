import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from '../movies.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { handleErrorResponse } from '../../commons/utils/handleErrorResponse';

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
            movie: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUniqueOrThrow: jest.fn(),
            },
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a movie list', async () => {
    const movies = [
      {
        id: 1,
        title: 'movie1',
        releaseYear: 2023,
        image: 'default.jpg',
        producerId: 1,
        directorId: 1,
        shortSynopsis: null,
        longSynopsis: null,
        teamComment: null,
      },
      {
        id: 2,
        title: 'movie2',
        releaseYear: 2023,
        image: 'default.jpg',
        producerId: 1,
        directorId: 1,
        shortSynopsis: null,
        longSynopsis: null,
        teamComment: null,
      },
      {
        id: 3,
        title: 'movie3',
        releaseYear: 2023,
        image: 'default.jpg',
        producerId: 1,
        directorId: 1,
        shortSynopsis: null,
        longSynopsis: null,
        teamComment: null,
      },
    ];

    jest.spyOn(prismaService.movie, 'findMany').mockResolvedValue(movies);

    const result = await service.getList();

    expect(prismaService.movie.findMany).toHaveBeenCalled();
    expect(result).toEqual(movies);
  });

  it('should return a movie', async () => {
    const movie = {
      id: 1,
      title: 'movie1',
      releaseYear: 2023,
      image: 'default.jpg',
      producerId: 1,
      directorId: 1,
      shortSynopsis: null,
      longSynopsis: null,
      teamComment: null,
    };

    jest
      .spyOn(prismaService.movie, 'findUniqueOrThrow')
      .mockResolvedValue(movie);

    const result = await service.getOne(1);
    expect(prismaService.movie.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toEqual(movie);
  });

  it('should throw NotFoundException when getting a movie that does not exist', async () => {
    jest
      .spyOn(prismaService.movie, 'findUniqueOrThrow')
      .mockRejectedValue({ code: 'P2025' });

    expect(async () => await service.getOne(1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it.each([
    {
      title: 'Test Movie',
      releaseYear: '2023',
      producerId: '1',
      directorId: '1',
    },
    {
      title: 'Test Movie',
      releaseYear: '2023',
    },
  ])('should create a movie', async (body) => {
    const createMovieDTO = body;

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
        releaseYear: parseInt(body.releaseYear),
        producerId: body.producerId ? parseInt(body.producerId) : undefined,
        directorId: body.directorId ? parseInt(body.directorId) : undefined,
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

  /**
   * tags
   */

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
