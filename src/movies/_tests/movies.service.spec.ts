/* eslint-disable prettier/prettier */
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMovieDTO, UpdateMovieDTO } from '../DTO/movie.dto';
import { MoviesService } from '../movies.service';

describe('MoviesService', () => {
  let service: MoviesService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  const movieList = [
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
      tags: [
        {
          tag: {
            id: 1,
            label: 'tag1',
          }
        },
        {
          tag: {
            id: 2,
            label: 'tag2',
          }
        },
      ]
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
      tags: []
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
      tags: []
    },
  ];

  beforeAll(async () => {
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
    
    const movies = movieList;

    prismaMock.movie.findMany.mockResolvedValueOnce(movies);

    const result = await service.getList();

    expect(prismaMock.movie.findMany).toHaveBeenCalled();
    expect(result).toEqual(movies.map((cinema) => {
      return {
        ...cinema,
        tags: cinema.tags.map((movieTag) => movieTag.tag.label),
      };
    }));
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

  it('should throw NotFoundException when getting a movie that do not exists', async () => {
    prismaMock.movie.findUniqueOrThrow.mockRejectedValue({ code: 'P2025' });

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
    const createMovieDTO: CreateMovieDTO = body;

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

  it('should fail creating a movie with non number releaseYear', async () => {
    const movieDTO = {
      title: 'Test Movie',
      releaseYear: 'wrong',
    }

    await expect(service.create(movieDTO)).rejects.toThrow();
  })

  it('should handle error response if failed creating a movie', async () => {
    const createMovieDTO: CreateMovieDTO = {
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
    const updateMovieDTO: UpdateMovieDTO = data.body as UpdateMovieDTO;

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
    const updateMovieDTO: UpdateMovieDTO = {
      title: 'Test Movie2',
    } as UpdateMovieDTO;

    prismaMock.movie.update.mockRejectedValue({ code: 'P2025' });

    await expect(service.update(127, updateMovieDTO)).rejects.toThrow();
  });

  it('should fail updating a movie with wrong producer or director id', async () => {
    const updateMovieDTO: UpdateMovieDTO = {
      directorId: '1',
    }

    prismaMock.movie.update.mockRejectedValue({ code: 'P2003',  meta: {field_name: 'directorId'}});

    await expect(service.update(127, updateMovieDTO)).rejects.toThrow('Wrong value for director');
  })

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
      name: 'MGM',
      biography: 'Sa vie, son oeuvre',
    };

    prismaMock.producer.create.mockResolvedValue({ id: 1, ...producer });

    const result = await service.createProducer(producer);
    expect(result).toEqual({ id: 1, ...producer });
  });

  it('should return a list of producers', async () => {
    const producers = [
      {
        id: 1,
        name: 'MGM',
        biography: 'Sa vie, son oeuvre',
      },
      {
        id: 2,
        name: 'universal',
        biography: 'Sa vie, son oeuvre',
      },
      {
        id: 3,
        name: 'Twentieth Century Fox',
        biography: 'Sa vie, son oeuvre',
      },
    ];

    prismaMock.producer.findMany.mockResolvedValue(producers);

    expect(await service.getProducers()).toEqual([...producers]);
  });

  it("should get a producer's details", async () => {
    const producer = {
      id: 1,
      name: 'MGM',
      biography: 'Sa vie, son oeuvre',
    };

    prismaMock.producer.findUniqueOrThrow.mockResolvedValue(producer);

    expect(await service.getProducer(1)).toEqual(producer);
  });

  it('Should fail getting a producer when not found', async () => {
    prismaMock.producer.findUniqueOrThrow.mockRejectedValue({ code: 'P2025' });

    await expect(async () => await service.getProducer(1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update a producer', async () => {
    const updateProducerDTO = {
      name: 'MGM',
    };

    const updated = {
      id: 1,
      name: updateProducerDTO.name,
      biography: 'Sa vie, son oeuvre',
    };

    prismaMock.producer.update.mockResolvedValue(updated);

    await expect(service.updateProducer(1, updateProducerDTO)).resolves.toEqual(
      { ...updated },
    );
  });

  it('should fail updating a producer that is not found', async () => {
    const updateProducerDTO = {
      name: 'MGM',
    };

    prismaMock.producer.update.mockRejectedValue({ code: 'P2025' });

    await expect(
      async () => await service.updateProducer(1, updateProducerDTO),
    ).rejects.toThrow(NotFoundException);
  });

  it('should delete a producer', async () => {
    const deleted = {
      id: 1,
      name: 'MGM',
      biography: null,
    };

    prismaMock.producer.delete.mockResolvedValue(deleted);

    expect(service.deleteProducer(1)).resolves.toEqual({ ...deleted });
  });

  it('should fail deleting a producer that is not found', async () => {
    prismaMock.producer.delete.mockRejectedValue({ code: 'P2025' });

    await expect(
      async () => await service.deleteProducer(1),
    ).rejects.toThrow(NotFoundException);
  });

  it('should get movies of a producer', async () => {
    const producer = {
      id: 1,
      name: 'MGM',
      biography: 'Sa vie, son oeuvre'
    };

    const movies = movieList;
    
    prismaMock.producer.findUniqueOrThrow.mockResolvedValue(producer);

    prismaMock.movie.findMany.mockResolvedValue(movies);

    const result = await service.getProducerMovies(1);

    expect(prismaMock.movie.findMany).toHaveBeenCalled();
    expect(result).toEqual(movies);
  });

  it('sould fail getting movies of a producer that is not found', async () => {
    prismaMock.producer.findUniqueOrThrow.mockRejectedValue({ code: 'P2025' });

    await expect(
      async () => await service.getProducerMovies(1),
    ).rejects.toThrow(NotFoundException);
  });

  /**
   * directors
   */

  it('should create a director', async () => {
    const director = {
      name: 'Coppola',
      biography: 'Sa vie, son oeuvre',
    };

    prismaMock.director.create.mockResolvedValue({ id: 1, ...director });

    const result = await service.createDirector(director);
    expect(result).toEqual({ id: 1, ...director });
  });

  it('should return a list of directors', async () => {
    const directors = [
      {
        id: 1,
        name: 'Coppola',
        biography: 'Sa vie, son oeuvre',
      },
      {
        id: 2,
        name: 'Ridley Scott',
        biography: 'Sa vie, son oeuvre',
      },
      {
        id: 3,
        name: 'Tod Browning',
        biography: 'Sa vie, son oeuvre',
      },
    ];

    prismaMock.director.findMany.mockResolvedValue(directors);

    expect(await service.getDirectors()).toEqual([...directors]);
  });

  it("should get a director's details", async () => {
    const director = {
      id: 1,
      name: 'Coppola',
      biography: 'Sa vie, son oeuvre',
    };

    prismaMock.director.findUniqueOrThrow.mockResolvedValue(director);

    expect(await service.getDirector(1)).toEqual(director);
  });

  it('Should fail getting a director when not found', async () => {
    prismaMock.director.findUniqueOrThrow.mockRejectedValue({ code: 'P2025' });

    await expect(async () => await service.getDirector(1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update a director', async () => {
    const updateDirectorDTO = {
      name: 'Coppola',
    };

    const updated = {
      id: 1,
      name: updateDirectorDTO.name,
      biography: 'Sa vie, son oeuvre',
    };

    prismaMock.director.update.mockResolvedValue(updated);

    await expect(service.updateDirector(1, updateDirectorDTO)).resolves.toEqual(
      { ...updated },
    );
  });

  it('should fail director a producer that is not found', async () => {
    const updateDirectorDTO = {
      name: 'Coppola',
    };

    prismaMock.director.update.mockRejectedValue({ code: 'P2025' });

    await expect(
      async () => await service.updateDirector(1, updateDirectorDTO),
    ).rejects.toThrow(NotFoundException);
  });

  it('should delete a director', async () => {
    const deleted = {
      id: 1,
      name: 'Coppola',
      biography: null,
    };

    prismaMock.director.delete.mockResolvedValue(deleted);

    expect(service.deleteDirector(1)).resolves.toEqual({ ...deleted });
  });

  it('should fail deleting a director that is not found', async () => {
    prismaMock.director.delete.mockRejectedValue({ code: 'P2025' });

    await expect(
      async () => await service.deleteDirector(1),
    ).rejects.toThrow(NotFoundException);
  });

  it('should get movies of a director', async () => {
    const director = {
      id: 1,
      name: 'Coppola',
      biography: 'Sa vie, son oeuvre'
    };

    const movies = movieList;
    
    prismaMock.director.findUniqueOrThrow.mockResolvedValue(director);

    prismaMock.movie.findMany.mockResolvedValue(movies);

    const result = await service.getDirectorMovies(1);

    expect(prismaMock.movie.findMany).toHaveBeenCalled();
    expect(result).toEqual(movies);
  });

  it('sould fail getting movies of a director that is not found', async () => {
    prismaMock.director.findUniqueOrThrow.mockRejectedValue({ code: 'P2025' });

    await expect(
      async () => await service.getDirectorMovies(1),
    ).rejects.toThrow(NotFoundException);
  });
});