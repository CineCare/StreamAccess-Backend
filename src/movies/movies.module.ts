import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService],
  imports: [PrismaModule],
  exports: [MoviesService]
})
export class MoviesModule {}
