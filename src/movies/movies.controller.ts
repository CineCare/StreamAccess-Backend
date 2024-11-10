import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guard/admin-auth.guard';
import { CreateMovieDTO } from './DTO/movieCreate.dto';

@Controller('movies')
@ApiTags('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

  @Get('')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getList() {
    return this.moviesService.getList();
  }

  @Post('')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  create(@Body() body: CreateMovieDTO) {
    return this.moviesService.create(body);
  }
  
}
