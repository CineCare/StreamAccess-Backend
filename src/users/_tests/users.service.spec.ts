import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users.service';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
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

  it('should update a user', async () => {
    const data = {
      id: 1,
      pseudo: 'test',
      actualPassword: 'test',
      newPassword: 'updated',
      newPasswordConfirm: 'updated',
    };

    const hash = await bcrypt.hash(data.actualPassword, 10);
    prismaMock.user.findUnique.mockResolvedValue({
      id: data.id,
      pseudo: 'before_test',
      password: hash,
      email: 'admin@codevert.org',
      isActive: true,
      updatedAt: new Date(),
      createdAt: new Date(),
    });
    prismaMock.user.update.mockResolvedValue({
      id: data.id,
      pseudo: 'test',
      password: 'updated',
      email: 'admin@codevert.org',
      isActive: true,
      updatedAt: new Date(),
      createdAt: new Date(),
    });

    const result = await service.updateMe(1, data);

    expect(result).toEqual({
      id: 1,
      pseudo: data.pseudo,
      email: 'admin@codevert.org',
      errors: [],
    });
  });

  it('should fail updating a wrong user', async () => {
    const data = {
      id: 2,
      pseudo: 'test2',
      actualPassword: 'test',
    };

    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(async () => await service.updateMe(1, data)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should fail updating with a wrong password', async () => {
    const data = {
      id: 3,
      pseudo: 'test3',
      actualPassword: 'test',
    };

    prismaMock.user.findUnique.mockResolvedValue({
      id: data.id,
      pseudo: 'test',
      password: 'fake',
      email: 'admin@codevert.org',
      isActive: true,
      updatedAt: new Date(),
      createdAt: new Date(),
    });

    await expect(async () => await service.updateMe(1, data)).rejects.toThrow(
      'Le mot de passe actuel est invalide',
    );
  });

  it('should fail updating a password without new password and / or confirmation', async () => {
    const data = {
      id: 4,
      pseudo: 'test4',
      actualPassword: 'test',
    };

    const hash = await bcrypt.hash(data.actualPassword, 10);

    prismaMock.user.findUnique.mockResolvedValue({
      id: data.id,
      pseudo: 'test',
      password: hash,
      email: 'admin@codevert.org',
      isActive: true,
      updatedAt: new Date(),
      createdAt: new Date(),
    });

    const result = async () => await service.updateMe(1, data);

    await expect(result).rejects.toThrow(
      'Pour changer de mot de passe, vous devez renseigner le nouveau mot de passe et le confirmer',
    );
  });

  it('should fail updating a password with new password different from confirmation', async () => {
    const data = {
      id: 5,
      pseudo: 'test5',
      actualPassword: 'test',
      newPassword: 'newPassword',
      newPasswordConfirm: 'passwordConfirm',
    };

    const hash = await bcrypt.hash(data.actualPassword, 10);

    prismaMock.user.findUnique.mockResolvedValue({
      id: data.id,
      pseudo: 'test',
      password: hash,
      email: 'admin@codevert.org',
      isActive: true,
      updatedAt: new Date(),
      createdAt: new Date(),
    });

    await expect(async () => await service.updateMe(1, data)).rejects.toThrow(
      'Le nouveau mot de passe et la confirmation sont différents',
    );
  });
});
