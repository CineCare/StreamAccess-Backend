import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class CreateMovieDTO {
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsNumberString()
  releaseYear: string;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  @IsNumberString()
  producerId?: string;

  @ApiProperty()
  @IsNumberString()
  directorId?: string;
}
