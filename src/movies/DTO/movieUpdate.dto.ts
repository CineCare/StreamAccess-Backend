import { PartialType } from '@nestjs/swagger';
import { CreateMovieDTO } from './movieCreate.dto';

export class UpdateMovieDTO extends PartialType(CreateMovieDTO) {}
