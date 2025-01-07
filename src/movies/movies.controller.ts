import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { castNumParam } from 'src/commons/utils/castNumParam';
import { AdminAuthGuard } from '../auth/guard/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateMovieDTO } from './DTO/movieCreate.dto';
import { MoviesService } from './movies.service';
import { UpdateMovieDTO } from './DTO/movieUpdate.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from '../commons/utils/fileUpload';

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
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './assets/movies_images',
      filename: editFileName
    })
  }))
  create(@Body() body: CreateMovieDTO, @UploadedFile() file) {
    return this.moviesService.create(body);
  }
  
  @Put(':id')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './assets/movies_images',
      filename: editFileName
    })
  }))
  update(@Param('id') id: string, @Body() body: UpdateMovieDTO, @UploadedFile() file) {
    body.releaseYear = castNumParam('releaseYear', body.releaseYear);
    body.image = file.filename;
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
