import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
//import { JwtStrategy } from '../auth/strategy/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [EventsGateway],
})
export class EventsModule {}
