import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthEntity } from './entities/auth.entity';
import { MailService } from '../mail/mail.service';

//TODO set in .env
export const roundsOfHashing = 10;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    const isPasswordValid = !user
      ? false
      : await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect email and/or password !');
    }
    return {
      accessToken: this.jwtService.sign({ userId: user.id }),
    };
  }

  async register(
    pseudo: string,
    email: string,
    password: string,
  ): Promise<AuthEntity> {
    const hash = await bcrypt.hash(password, roundsOfHashing);
    const existingUser = await this.prisma.user.findFirst({ where: { email } });
    if (existingUser !== null) {
      throw new BadRequestException('email ou mot de passe invalide');
    }
    const user = await this.prisma.user.create({
      data: { pseudo, email, password: hash, isActive: false },
    });
    await this.mailService.sendRegistrationRequest(pseudo, email);
    return {
      accessToken: this.jwtService.sign({ userId: user.id }),
    };
  }

  async validate(ids: number[]): Promise<void> {
    for(let id of ids) {
      const user = await this.prisma.user.findFirstOrThrow({ where: { id } });
      await this.prisma.user.update({ data: { isActive: true }, where: { id } });
      await this.mailService.sendAccountValidation(user.pseudo, user.email);
    }
    
  }

  async reject(ids: number[]): Promise<void> {
    for(let id of ids) {
      const user = await this.prisma.user.findFirstOrThrow({ where: { id } });
      await this.mailService.sendAccountRejection(user.pseudo, user.email);
      await this.prisma.user.delete({ where: { id } });
    }
  }
}
