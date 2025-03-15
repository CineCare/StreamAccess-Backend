import { Module } from '@nestjs/common';
import { StreamsController } from './streams.controller';
import { StreamsService } from './streams.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      dest: './assets/movies_streams',
    }),
  ],
  controllers: [StreamsController],
  providers: [StreamsService],
})
export class StreamsModule {}
