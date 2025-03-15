import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { MoviesModule } from './movies/movies.module';
import { StreamsModule } from './streams/streams.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PrismaModule,
    MailModule,
    MoviesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    StreamsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
