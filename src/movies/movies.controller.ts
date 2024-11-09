import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

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
}
