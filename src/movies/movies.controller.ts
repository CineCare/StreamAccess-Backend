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
import { AdminAuthGuard } from '../auth/guard/admin-auth.guard';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateMovieDTO, UpdateMovieDTO } from './DTO/movie.dto';
import { MoviesService } from './movies.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editMovieFileName } from '../commons/utils/fileUpload';
import { CreateMovieTagDTO } from './DTO/movieTagCreate.dto';
import { CreateProducerDTO } from './DTO/producerCreate.dto';
import { CreateDirectorDTO } from './DTO/directorCreate.dto';
import { ParseQueryIdPipe } from '../commons/validationPipes/parseQueryId.pipe';
import { bodyValidationPipe } from '../commons/validationPipes/bodyValidation.pipe';
import { idListValidationPipe } from '../commons/validationPipes/IdListValidation.pipe';

const movieIdValidationPipe = new ParseQueryIdPipe('Movie');
const tagIdValidationPipe = new ParseQueryIdPipe('Tag');
const producerIdValidationPipe = new ParseQueryIdPipe('Producer');
const directorIdValidationPipe = new ParseQueryIdPipe('Director');

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
   **  Must be placed before @Get(':id') to avoid conflicts
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

  @Get('directors')
  @ApiOkResponse()
  @ApiBearerAuth()
  getDirectors() {
    return this.moviesService.getDirectors();
  }

  /**
   *
   ** Movies
   *
   */

  @Get(':id')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getOne(
    @Param('id', movieIdValidationPipe)
    id: number,
  ) {
    return this.moviesService.getOne(id);
  }

  @Post('')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: {
        fileSize: 8000000, // Compliant: 8MB
      },
      storage: diskStorage({
        destination: './assets/movies_images',
        filename: editMovieFileName,
      }),
    }),
  )
  create(
    @Body(bodyValidationPipe) body: CreateMovieDTO,
    @UploadedFile() file: Express.Multer.File,
  ) {
    body.image = file ? file.filename : undefined;
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
        filename: editMovieFileName,
      }),
    }),
  )
  update(
    @Param('id', movieIdValidationPipe) id: number,
    @Body(bodyValidationPipe) body: UpdateMovieDTO,
    @UploadedFile() file,
  ) {
    body.image = file ? file.filename : undefined;
    return this.moviesService.update(id, body);
  }

  @Delete(':id')
  @ApiOkResponse()
  @ApiBearerAuth()
  @HttpCode(204)
  @UseGuards(AdminAuthGuard)
  delete(@Param('id', movieIdValidationPipe) id: number) {
    return this.moviesService.delete(id);
  }

  /**
   *
   ** Tags
   *
   */

  @Post('tag')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  createTag(@Body(bodyValidationPipe) body: CreateMovieTagDTO) {
    return this.moviesService.createTag(body);
  }

  @Delete('tag/:id')
  @ApiOkResponse()
  @ApiBearerAuth()
  @HttpCode(204)
  @UseGuards(AdminAuthGuard)
  deleteTag(@Param('id', tagIdValidationPipe) id: number) {
    return this.moviesService.deleteTag(id);
  }

  @Post(':id/tags')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  addTags(
    @Param('id', movieIdValidationPipe) id: number,
    @Body(idListValidationPipe) body: number[],
  ) {
    return this.moviesService.addTags(id, body);
  }

  @Get(':id/tags')
  @ApiOkResponse()
  @ApiBearerAuth()
  getMovieTags(@Param('id', movieIdValidationPipe) id: number) {
    return this.moviesService.getMovieTags(id);
  }

  @Delete(':id/tags')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  deleteMovieTags(
    @Param('id', movieIdValidationPipe) id: number,
    @Body(idListValidationPipe) body: number[],
  ) {
    return this.moviesService.deleteMovieTagMovieList(id, body);
  }

  /**
   *
   ** Producers
   *
   */

  @Post('producer')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  createProducer(@Body(bodyValidationPipe) body: CreateProducerDTO) {
    return this.moviesService.createProducer(body);
  }

  @Get('producer/:id')
  @ApiOkResponse()
  @ApiBearerAuth()
  getProducer(@Param('id', producerIdValidationPipe) id: number) {
    return this.moviesService.getProducer(id);
  }

  @Put('producer/:id')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  updateProducer(
    @Param('id', producerIdValidationPipe) id: number,
    @Body() body: CreateProducerDTO,
  ) {
    return this.moviesService.updateProducer(id, body);
  }

  @Delete('producer/:id')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  deleteProducer(@Param('id', producerIdValidationPipe) id: number) {
    return this.moviesService.deleteProducer(id);
  }

  @Get('producer/:id/movies')
  @ApiOkResponse()
  @ApiBearerAuth()
  getProducerFilms(@Param('id', producerIdValidationPipe) id: number) {
    return this.moviesService.getProducerMovies(id);
  }

  /**
   *
   ** Directors
   *
   */

  @Post('director')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  createDirector(@Body(bodyValidationPipe) body: CreateDirectorDTO) {
    return this.moviesService.createDirector(body);
  }

  @Get('director/:id')
  @ApiOkResponse()
  @ApiBearerAuth()
  getDirector(@Param('id', directorIdValidationPipe) id: number) {
    return this.moviesService.getDirector(id);
  }

  @Put('director/:id')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  updateDirector(
    @Param('id', directorIdValidationPipe) id: number,
    @Body(bodyValidationPipe) body: CreateDirectorDTO,
  ) {
    return this.moviesService.updateDirector(id, body);
  }

  @Delete('director/:id')
  @ApiOkResponse()
  @ApiBearerAuth()
  @UseGuards(AdminAuthGuard)
  deleteDirector(@Param('id', directorIdValidationPipe) id: number) {
    return this.moviesService.deleteDirector(id);
  }

  @Get('director/:id/movies')
  @ApiOkResponse()
  @ApiBearerAuth()
  getDirectorFilms(@Param('id', directorIdValidationPipe) id: number) {
    return this.moviesService.getDirectorMovies(id);
  }
}
