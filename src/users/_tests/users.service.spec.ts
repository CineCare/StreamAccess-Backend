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

  it('should get my user data with prefs', async () => {
    const user = {
      id: 1,
      pseudo: 'test1',
      email: 'test.codevert.org',
      password: 'secret',
      isActive: true,
      prefs: [
        {
          id: 1,
          name: 'test',
          value: 'test',
          profileName: 'test',
          userId: 1,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mappedUser = {
      ...user,
      prefs: {
        test: {
          test: 'test',
        },
      },
    };

    const prefTypes = [
      {
        id: 1,
        prefName: 'test',
        dataType: 'string',
      },
    ];

    prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce(user);
    prismaMock.prefType.findMany.mockResolvedValue(prefTypes);

    const result = await service.getOne(1, {
      email: true,
      prefs: { select: { name: true, value: true, profileName: true } },
    });

    expect(result).toEqual(mappedUser);
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
    };

    const user = {
      id: data.id,
      pseudo: 'before_test',
      password: 'hash',
      email: 'admin@codevert.org',
      isActive: true,
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    const updatedUser = {
      ...user,
      pseudo: data.pseudo,
    };

    const mappedUser = {
      id: data.id,
      pseudo: data.pseudo,
      email: user.email,
      prefs: undefined,
      errors: undefined,
    };

    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.user.update.mockResolvedValue(updatedUser);

    const result = await service.updateMe(1, data);

    expect(result).toEqual(mappedUser);
  });

  it('should update a user with password and prefs', async () => {
    const data = {
      id: 1,
      pseudo: 'test',
      actualPassword: 'test',
      newPassword: 'updated',
      newPasswordConfirm: 'updated',
      prefs: [
        {
          name: 'theme',
          value: 'soft',
          profileName: 'test',
        },
        {
          name: 'test',
          value: 'test',
          profileName: 'test',
        },
      ],
    };

    const hash = await bcrypt.hash(data.actualPassword, 10);
    const user = {
      id: data.id,
      pseudo: 'before_test',
      password: hash,
      email: 'admin@codevert.org',
      isActive: true,
      prefs: [
        {
          id: 1,
          name: 'theme',
          value: 'default',
          profileName: 'test',
          userId: 1,
        },
      ],
      updatedAt: new Date(),
      createdAt: new Date(),
    };

    const updatedUser = {
      ...user,
      pseudo: data.pseudo,
      password: await bcrypt.hash(data.newPassword, 10),
      email: user.email,
      isActive: user.isActive,
      prefs: [
        {
          id: 1,
          name: 'theme',
          value: 'soft',
          profileName: 'test',
          userId: 1,
        },
      ],
    };

    const pref = {
      id: 1,
      name: 'theme',
      value: 'default',
      profileName: 'test',
      userId: 1,
    };

    const prefTypes = {
      id: 1,
      prefName: 'theme',
      dataType: 'enum',
    };

    prismaMock.user.findUnique.mockResolvedValue(user);
    prismaMock.prefs.findFirst.mockResolvedValue(pref);
    prismaMock.prefs.findMany.mockResolvedValue([pref]);
    prismaMock.prefType.findFirst.mockResolvedValue(prefTypes);
    prismaMock.prefType.findMany.mockResolvedValue([prefTypes]);
    prismaMock.user.update.mockResolvedValue(updatedUser);

    const result = await service.updateMe(1, data);
    const mappedUser = {
      id: data.id,
      pseudo: data.pseudo,
      email: user.email,
      prefs: {
        test: {
          theme: 'soft',
        },
      },
      errors: [
        'Preference test has invalid value test. Allowed values are: default, soft, lightTheme, highContrast, largeText',
      ],
    };

    expect(result).toEqual(mappedUser);
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

  it('should cast user prefs', async () => {
    const prefs = [
      {
        id: 1,
        name: 'highConstrast',
        value: 'true',
        profileName: 'test',
        userId: 1,
      },
      {
        id: 2,
        name: 'audioDescription',
        value: 'false',
        profileName: 'test',
        userId: 1,
      },
      {
        id: 3,
        name: 'fontSize',
        value: '14',
        profileName: 'test',
        userId: 1,
      },
    ];

    const user = {
      id: 1,
      pseudo: 'test',
      prefs: prefs,
    };

    const prefTypes = [
      {
        id: 1,
        prefName: 'highConstrast',
        dataType: 'boolean',
      },
      {
        id: 2,
        prefName: 'audioDescription',
        dataType: 'boolean',
      },
      {
        id: 3,
        prefName: 'fontSize',
        dataType: 'number',
      },
    ];

    prismaMock.prefType.findMany.mockResolvedValue(prefTypes);

    await service.castUserPrefs(user);
    const expectedResult = {
      ...user,
      prefs: [
        {
          id: 1,
          name: 'highConstrast',
          value: true,
          profileName: 'test',
          userId: 1,
        },
        {
          id: 2,
          name: 'audioDescription',
          value: false,
          profileName: 'test',
          userId: 1,
        },
        {
          id: 3,
          name: 'fontSize',
          value: 14,
          profileName: 'test',
          userId: 1,
        },
      ],
    };
    expect(user).toEqual(expectedResult);
  });

  it('should handle prefs', async () => {
    const prefs = [
      {
        id: 1,
        name: 'highConstrast',
        value: true,
        profileName: 'test',
        userId: 1,
      },
      {
        id: 1,
        name: 'wrong',
        value: 'true',
        profileName: 'test',
        userId: 1,
      },
    ];

    const existingPrefs = [];

    prismaMock.prefs.findMany.mockResolvedValue(existingPrefs);
    prismaMock.prefType.findFirst.mockResolvedValue({
      id: 1,
      prefName: 'highConstrast',
      dataType: 'boolean',
    });

    const prefTypes = [
      {
        id: 1,
        prefName: 'highConstrast',
        dataType: 'boolean',
      },
    ];
    prismaMock.prefType.findMany.mockResolvedValue(prefTypes);
    const result = await service.handlePrefs(prefs, 1);
    const expectedResult = [
      'Preference wrong has type boolean but you provided string.',
    ];
    expect(result).toEqual(expectedResult);
  });

  it('should add prefType', async () => {
    const prefType = {
      prefName: 'test',
      dataType: 'string',
    };

    prismaMock.prefType.create.mockResolvedValue({
      id: 1,
      prefName: prefType.prefName,
      dataType: prefType.dataType,
    });
    const result = await service.addPrefType(prefType);
    expect(result).toEqual({
      id: 1,
      prefName: prefType.prefName,
      dataType: prefType.dataType,
    });
  });

  it('should fail adding prefType with existing name', async () => {
    const prefType = {
      prefName: 'test',
      dataType: 'string',
    };

    prismaMock.prefType.findFirst.mockResolvedValue({
      id: 1,
      prefName: prefType.prefName,
      dataType: prefType.dataType,
    });

    await expect(
      async () => await service.addPrefType(prefType),
    ).rejects.toThrow(
      `Preference type with name ${prefType.prefName} already exists.`,
    );
  });

  it('should fail adding prefType with invalid type', async () => {
    const prefType = {
      prefName: 'test',
      dataType: 'wrong',
    };

    prismaMock.prefType.findFirst.mockResolvedValue(null);
    await expect(
      async () => await service.addPrefType(prefType),
    ).rejects.toThrow(
      'Type wrong is not allowed. Allowed types are: string, number, boolean, enum',
    );
  });
});
