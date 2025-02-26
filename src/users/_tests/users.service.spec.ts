import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get a list of users', async () => {
    const userList = [
      {
        id: 1,
        pseudo: 'test1',
        email: 'test.codevert.org',
        password: 'secret',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prismaMock.user.findMany.mockResolvedValue(userList);

    const result = await service.getList();

    expect(result).toEqual(userList);
  });

  it('should get a user by Id', async () => {
    const user = {
      id: 1,
      pseudo: 'test1',
      email: 'test.codevert.org',
      password: 'secret',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce(user);

    const result = await service.getOne(1);

    expect(result).toEqual(user);
  });

  it('should fail getting a user that do not exists', async () => {
    prismaMock.user.findUniqueOrThrow.mockRejectedValue({ code: 'P2025' });

    expect(async () => await service.getOne(1)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should get a list of candidates', async () => {
    const userList = [
      {
        id: 2,
        pseudo: 'testcandidate',
        email: 'test.codevert.org',
        password: 'secret',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    prismaMock.user.findMany.mockResolvedValue(userList);

    const result = await service.getCandidates();

    expect(result).toEqual(userList);
  });
});
