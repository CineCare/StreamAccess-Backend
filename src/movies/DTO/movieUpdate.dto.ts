import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateMovieDTO {
  @IsNotEmpty()
  @ApiProperty()
  title?: string;

  @IsNotEmpty()
  @ApiProperty()
  releaseYear?: number;

  @ApiProperty()
  image?: string;
}
