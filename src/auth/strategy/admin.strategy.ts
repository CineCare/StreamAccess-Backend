import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
//import { jwtSecret } from '../auth.module';

import { UsersService } from '../../users/users.service';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { userId: number }) {
    const adminList = process.env.ADMIN_EMAILS.split(';');
    const user = await this.userService.getOne(payload.userId, { email: true });
    if (!user || !adminList.includes(user.email)) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
