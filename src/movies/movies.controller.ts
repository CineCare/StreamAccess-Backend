import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { castNumParam } from '../commons/utils/castNumParam';
import { AdminAuthGuard } from '../auth/guard/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateMovieDTO } from './DTO/movieCreate.dto';
import { MoviesService } from './movies.service';
import { UpdateMovieDTO } from './DTO/movieUpdate.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName } from '../commons/utils/fileUpload';
import { CreateMovieTagDTO } from './DTO/movieTagCreate.dto';
import { CreateProducerDTO } from './DTO/producerCreate.dto';

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

  /**
   *
   *  Must be placed before @Get(':id') to avoid conflicts
   *
   */

  @Get('tags')
  @ApiOkResponse()
  @ApiBearerAuth()
  getTags() {
    return this.moviesService.getTags();
  }

  @Get('producers')
  @ApiOkResponse()
  @ApiBearerAuth()
  getProducers() {
    return this.moviesService.getProducers();
  }

  /**
   *
   * Movies
   *
   */

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
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './assets/movies_images',
        filename: editFileName,
      }),
    }),
  )
  create(
    @Body() body: CreateMovieDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    body.image = file.filename;
    return this.moviesService.create(body);
  }

  @Put(':id')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './assets/movies_images',
        filename: editFileName,
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() body: UpdateMovieDTO,
    @UploadedFile() file,
  ) {
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

  /**
   *
   *  Tags
   *
   */

  @Post('tag')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  createTag(@Body() body: CreateMovieTagDTO) {
    return this.moviesService.createTag(body);
  }

  @Delete('tag/:id')
  @ApiOkResponse()
  @ApiBearerAuth()
  @HttpCode(204)
  @UseGuards(AdminAuthGuard)
  deleteTag(@Param('id') id: string) {
    return this.moviesService.deleteTag(castNumParam('id', id));
  }

  @Post(':id/tags')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  addTags(@Param('id') id: string, @Body() body: number[]) {
    return this.moviesService.addTags(castNumParam('movie id', id), body);
  }

  @Get(':id/tags')
  @ApiOkResponse()
  @ApiBearerAuth()
  getMovieTags(@Param('id') id: string) {
    return this.moviesService.getMovieTags(castNumParam('movie id', id));
  }

  @Delete(':id/tags')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  deleteMovieTags(@Param('id') id: string, @Body() body: number[]) {
    return this.moviesService.deleteMovieTagMovieList(
      castNumParam('movie id', id),
      body,
    );
  }

  /**
   *
   * Producers
   *
   */

  @Post('producer')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  createProducer(@Body() body: CreateProducerDTO) {
    return this.moviesService.createProducer(body);
  }

  @Get('producer/:id')
  @ApiOkResponse()
  @ApiBearerAuth()
  getProducer(@Param('id') id: string) {
    return this.moviesService.getProducer(castNumParam('producerId', id));
  }

  @Put('producer/:id')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  updateProducer(@Param('id') id: string, @Body() body: CreateProducerDTO) {
    return this.moviesService.updateProducer(
      castNumParam('producerId', id),
      body,
    );
  }
}
