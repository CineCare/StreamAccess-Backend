import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
//import { jwtSecret } from '../auth.module';
import { UsersService } from '../../users/users.service';
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: { userId: number }) {
    const user = await this.userService.getOne(payload.userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    // Message pour les users non validés
    if (user && !user.isActive) {
      throw new UnauthorizedException('inactive');
    }
    return user;
  }
}
