import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from '../movies.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { UpdateMovieDTO } from '../DTO/movieUpdate.dto';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';

describe('MoviesService', () => {
  let service: MoviesService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
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

    prismaMock.movie.findMany.mockResolvedValueOnce(movies);

    const result = await service.getList();

    expect(prismaMock.movie.findMany).toHaveBeenCalled();
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

    prismaMock.movie.findUniqueOrThrow.mockResolvedValueOnce(movie);

    const result = await service.getOne(1);
    expect(prismaMock.movie.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toEqual(movie);
  });

  it('should throw NotFoundException when getting a movie that does not exist', async () => {
    prismaMock.movie.findUniqueOrThrow.mockRejectedValueOnce({ code: 'P2025' });

    expect(async () => await service.getOne(1)).rejects.toThrow();
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

    prismaMock.movie.create.mockResolvedValueOnce(createdMovie);

    const result = await service.create(createMovieDTO);

    expect(prismaMock.movie.create).toHaveBeenCalledWith({
      data: {
        ...createMovieDTO,
        releaseYear: parseInt(body.releaseYear),
        producerId: body.producerId ? parseInt(body.producerId) : undefined,
        directorId: body.directorId ? parseInt(body.directorId) : undefined,
      },
    });
    expect(result).toEqual(createdMovie);
  });

  it('should handle error response if failed creating a movie', async () => {
    const createMovieDTO = {
      title: 'Test Movie',
      releaseYear: '2023',
      producerId: '1',
      directorId: '1',
    };

    prismaMock.movie.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.create(createMovieDTO)).rejects.toThrow();
  });

  it.each([
    {
      id: 1,
      body: {
        title: 'Test Movie',
        releaseYear: '2023',
        producerId: '1',
        directorId: '1',
      },
    },
    {
      id: 2,
      body: {
        title: 'Test Movie2',
      },
    },
  ])('should update a movie', async (data) => {
    const updateMovieDTO = data.body as UpdateMovieDTO;

    const updatedMovie = {
      id: data.id,
      title: data.body.title,
      releaseYear: data.body.releaseYear
        ? parseInt(data.body.releaseYear)
        : 2023,
      producerId: data.body.producerId ? parseInt(data.body.producerId) : null,
      directorId: data.body.directorId ? parseInt(data.body.directorId) : null,
      image: 'default.jpg',
      shortSynopsis: 'Short synopsis',
      longSynopsis: 'Long synopsis',
      teamComment: 'Team comment',
    };

    prismaMock.movie.update.mockResolvedValue(updatedMovie);

    const result = await service.update(data.id, updateMovieDTO);

    expect(prismaMock.movie.update).toHaveBeenCalledWith({
      where: { id: data.id },
      data: {
        ...updateMovieDTO,
        releaseYear: data.body.releaseYear
          ? parseInt(data.body.releaseYear)
          : undefined,
        producerId: data.body.producerId
          ? parseInt(data.body.producerId)
          : undefined,
        directorId: data.body.directorId
          ? parseInt(data.body.directorId)
          : undefined,
      },
    });
    expect(result).toEqual(updatedMovie);
  });

  it('Should fail updating a movie if not found', async () => {
    const updateMovieDTO = {
      title: 'Test Movie2',
    } as UpdateMovieDTO;

    prismaMock.movie.update.mockRejectedValue({ code: 'P2025' });

    await expect(service.update(127, updateMovieDTO)).rejects.toThrow();
  });

  it('should delete a movie', async () => {
    const deletedMovie = {
      id: 1,
      title: 'Gone with the wind',
      releaseYear: 2023,
      producerId: 1,
      directorId: 1,
      image: 'default.jpg',
      shortSynopsis: 'Short synopsis',
      longSynopsis: 'Long synopsis',
      teamComment: 'Team comment',
    };

    jest.spyOn(prismaMock.movie, 'delete').mockResolvedValue(deletedMovie);
    const result = await service.delete(1);

    expect(result).toEqual(deletedMovie);
  });

  it('Should fail deleting a movie if not found', async () => {
    prismaMock.movie.delete.mockRejectedValue({ code: 'P2025' });

    expect(async () => await service.delete(1)).rejects.toThrow(
      NotFoundException,
    );
  });

  /**
   * tags
   */

  it('should return a tag list', async () => {
    const tagList = [
      {
        id: 1,
        label: 'tag1',
      },
      {
        id: 2,
        label: 'tag2',
      },
    ];

    jest.spyOn(prismaMock.movieTag, 'findMany').mockResolvedValue(tagList);

    const result = await service.getTags();

    expect(result).toEqual(tagList);
  });

  it('should return the tags of a movie', async () => {
    const movieTagMovies = [
      {
        id: 1,
        movieId: 2,
        tagId: 1,
      },
      {
        id: 2,
        movieId: 2,
        tagId: 2,
      },
      {
        id: 3,
        movieId: 2,
        tagId: 3,
      },
    ];
    prismaMock.movieTagMovie.findMany.mockResolvedValue(movieTagMovies);

    const result = await service.getMovieTags(2);

    expect(result).toBeDefined();
  });

  it('sould create a tag', async () => {
    const createMovieTagDTO = { label: 'tag1' };
    const mockedResult = {
      id: 1,
      label: createMovieTagDTO.label,
    };

    prismaMock.movieTag.create.mockResolvedValue(mockedResult);

    const result = await service.createTag(createMovieTagDTO);

    expect(result).toEqual({ ...mockedResult });
  });

  it('should delete a tag', async () => {
    const tag = {
      id: 1,
      label: 'tag',
    };
    prismaMock.movieTag.delete.mockResolvedValue(tag);
    const result = await service.deleteTag(1);
    expect(result).toEqual({ ...tag });
  });

  it('should fail deleting a tag when not found', async () => {
    prismaMock.movieTag.delete.mockRejectedValue({ code: 'P2025' });

    expect(async () => await service.deleteTag(1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should add tags to a movie', async () => {
    const movieId = 1;
    const movieTags = [{ id: 1 }, { id: 2 }, { id: 3 }];

    const existing = [
      {
        id: 4,
        movieId,
        tagId: 4,
      },
      {
        id: 5,
        movieId,
        tagId: 5,
      },
      {
        id: 6,
        movieId,
        tagId: 6,
      },
    ];

    jest
      .spyOn(prismaMock.movieTag, 'count')
      .mockResolvedValue(movieTags.length);
    jest
      .spyOn(prismaMock.movieTagMovie, 'createMany')
      .mockResolvedValue({ count: movieTags.length });
    jest
      .spyOn(prismaMock.movieTagMovie, 'findMany')
      .mockResolvedValue(existing);

    const result = await service.addTags(
      movieId,
      movieTags.map((e) => e.id),
    );

    expect(prismaMock.movieTag.count).toHaveBeenCalledWith({
      where: { id: { in: movieTags.map((e) => e.id) } },
    });
    expect(prismaMock.movieTagMovie.createMany).toHaveBeenCalledWith({
      data: movieTags.map((tagId) => ({ movieId, tagId: tagId.id })),
    });
    expect(result).toEqual({ success: true, created: movieTags.length });
  });

  it('should throw NotFoundException if some tags do not exist', async () => {
    const movieId = 1;
    const tagIds = [1, 2, 3];
    const tags = [
      {
        id: 1,
        label: 'tag1',
      },
      {
        id: 1,
        label: 'tag1',
      },
      {
        id: 1,
        label: 'tag1',
      },
    ];

    jest.spyOn(prismaMock.movieTag, 'findMany').mockResolvedValue(tags);
    jest
      .spyOn(prismaMock.movieTag, 'count')
      .mockResolvedValue(tagIds.length - 1);

    expect(async () => await service.addTags(movieId, tagIds)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should remove tags from a movie', async () => {
    const tagsIds = [1, 2, 3];

    prismaMock.movieTag.count.mockResolvedValue(3);
    prismaMock.movieTagMovie.deleteMany.mockResolvedValue({ count: 2 });

    await expect(service.deleteMovieTagMovieList(1, tagsIds)).resolves.toEqual({
      success: true,
      deleted: 2,
    });
  });

  /**
   * producers
   */

  it('should create a producer', async () => {
    const producer = {
      name: 'Coppola',
      biography: 'Sa vie, son oeuvre',
    };

    prismaMock.producer.create.mockResolvedValue({ id: 1, ...producer });

    expect(service.createProducer(producer)).not.toBeNull();
  });
});
