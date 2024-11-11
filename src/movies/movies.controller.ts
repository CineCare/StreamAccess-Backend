import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { castNumParam } from 'src/commons/utils/castNumParam';
import { AdminAuthGuard } from '../auth/guard/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateMovieDTO } from './DTO/movieCreate.dto';
import { MoviesService } from './movies.service';
import { UpdateMovieDTO } from './DTO/movieUpdate.dto';

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

  @Get(':id')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getOne(@Param('id') id: string) {
    return this.moviesService.getOne(castNumParam('id', id));
  }

  @Post('')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  create(@Body() body: CreateMovieDTO) {
    return this.moviesService.create(body);
  }
  
  @Put(':id')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  update(@Param('id') id: string, @Body() body: UpdateMovieDTO) {
    return this.moviesService.update(castNumParam('id', id), body);
  }

  @Delete(':id')
  @ApiOkResponse()
  @ApiBearerAuth()
  @HttpCode(204)
  @UseGuards(AdminAuthGuard)
  delete(@Param('id') id: string) {
    return this.moviesService.delete(castNumParam('id', id));
  }
}
