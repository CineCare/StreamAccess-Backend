import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from '../../mail/mail.module';
import { UsersModule } from '../../users/users.module';
import { AuthController } from '../auth.controller';
import { jwtSecret } from '../auth.module';
import { AdminStrategy } from '../strategy/admin.strategy';
import { prismaMock } from './prismaMock';
import * as bcrypt from 'bcrypt';
import { MailService } from '../../mail/mail.service';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: DeepMockProxy<PrismaClient>;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: jwtSecret,
          signOptions: { expiresIn: '1d' },
        }),
        UsersModule,
        MailModule,
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        AdminStrategy,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(), // Ensure this is properly mocked
              create: jest.fn(),
              findFirst: jest.fn(),
            },
          },
        },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    service = module.get<AuthService>(AuthService);
    prisma = prismaMock;
    mailService = module.get<MailService>(MailService);
    mailService.sendRegistrationRequest = jest.fn();
    mailService.sendAccountValidation = jest.fn();
    mailService.sendAccountRejection = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should login', async () => {
    const mockUser = {
      id: 1,
      pseudo: 'testlogin',
      email: 'testlogin@gmail.com',
      password: await bcrypt.hash('1234', 10), // Hachez le mot de passe
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockImplementation(() => true);
    jest.spyOn(service['jwtService'], 'sign').mockReturnValue('mockToken');

    const result = await service.login({
      email: 'testlogin@gmail.com',
      password: '1234',
    });
    expect(result).toBeDefined();
    expect(result.accessToken).toBeDefined();
  });

  it('should not login with wrong password', async () => {
    const mockUser = {
      id: 1,
      pseudo: 'testlogin',
      email: 'testlogin@gmail.com',
      password: '1234',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);
    expect(
      async () =>
        await service.login({
          email: 'test.login@gmail.com',
          password: 'Whitedog44',
        }),
    ).rejects.toThrow();
  });

  it('should register', async () => {
    const data = {
      pseudo: 'test',
      email: 'test.email@codevert.org',
      password: 'Codevert_1234',
    };
    jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
    jest.spyOn(prisma.user, 'create').mockResolvedValue({
      id: 1,
      pseudo: data.pseudo,
      email: data.email,
      password: 'kjl',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    jest
      .spyOn(mailService, 'sendRegistrationRequest')
      .mockImplementation(() => null);
    jest.spyOn(service['jwtService'], 'sign').mockReturnValue('mockToken');
    const result = await service.register(
      data.pseudo,
      data.email,
      data.password,
    );
    expect(result).toBeDefined();
    expect(result.accessToken).toBeDefined();
  });

  it('should not register if email already used', async () => {
    const data = {
      pseudo: 'testlogin',
      email: 'testlogin@gmail.com',
      password: 'Codevert_1234',
    };
    const mockUser = {
      id: 1,
      pseudo: 'testlogin',
      email: 'testlogin@gmail.com',
      password: 'Codevert_1234',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser);
    const result = async () =>
      await service.register(data.pseudo, data.email, data.password);
    expect(result).rejects.toThrow();
    try {
      await result();
    } catch (e) {
      expect(e.message).toBe('email ou mot de passe invalide');
    }
  });

  it('should validate', async () => {
    const mockUser = {
      id: 1,
      pseudo: 'testlogin',
      email: 'testlogin@gmail.com',
      password: 'Codevert_1234',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(prisma.user, 'findFirstOrThrow').mockResolvedValue(mockUser);
    jest
      .spyOn(prisma.user, 'update')
      .mockResolvedValue({ ...mockUser, isActive: true });
    jest
      .spyOn(mailService, 'sendAccountValidation')
      .mockImplementation(() => null);
    const result = async () => await service.validate([1]);
    expect(result).not.toThrow();
  });

  it('should reject', async () => {
    const mockUser = {
      id: 1,
      pseudo: 'testlogin',
      email: 'testlogin@gmail.com',
      password: 'Codevert_1234',
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(prisma.user, 'findFirstOrThrow').mockResolvedValue(mockUser);
    jest.spyOn(prisma.user, 'delete').mockResolvedValue(mockUser);
    jest
      .spyOn(mailService, 'sendAccountRejection')
      .mockImplementation(() => null);
    const result = async () => await service.reject([1]);
    expect(result).not.toThrow();
  });
});
