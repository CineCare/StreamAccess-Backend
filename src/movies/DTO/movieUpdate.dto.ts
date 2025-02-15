import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateMovieDTO {
  @IsNotEmpty()
  @ApiProperty()
  title?: string;

  @IsNotEmpty()
  @ApiProperty()
  releaseYear?: string;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  producerId?: string;

  @ApiProperty()
  directorId?: string;
}
