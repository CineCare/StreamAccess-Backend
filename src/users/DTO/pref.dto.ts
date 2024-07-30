import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PrefDTO {
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @ApiProperty()
  theme?: string;

  @ApiProperty()
  images?: boolean;

  @ApiProperty()
  audio?: boolean;

  @ApiProperty()
  helpLevel?: number;
}
