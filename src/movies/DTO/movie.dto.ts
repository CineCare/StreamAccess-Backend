import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

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

  @ApiProperty()
  @IsString()
  shortSynopsis?: string;

  @ApiProperty()
  @IsString()
  longSynopsis?: string;

  @ApiProperty()
  @IsString()
  teamComment?: string;
}

export class UpdateMovieDTO extends PartialType(CreateMovieDTO) {}
