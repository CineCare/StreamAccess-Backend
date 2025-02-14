import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieTagDTO {
  @ApiProperty()
  label: string;
}
