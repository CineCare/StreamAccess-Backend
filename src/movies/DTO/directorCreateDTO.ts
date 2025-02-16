import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateDirectorDTO {
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @ApiProperty()
  biography?: string;
}
