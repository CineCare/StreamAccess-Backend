import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateMovieEntity {
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsNotEmpty()
  @ApiProperty()
  releaseYear: number;

  @ApiProperty()
  image?: string;

  @ApiProperty()
  producerId?: number;

  @ApiProperty()
  directorId?: number;
}
