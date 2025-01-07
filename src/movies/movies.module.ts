import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService],
  imports: [
    PrismaModule,
    MulterModule.register({
      dest: './assets/movies_images'
    })
  ],
  exports: [MoviesService]
})
export class MoviesModule {}
