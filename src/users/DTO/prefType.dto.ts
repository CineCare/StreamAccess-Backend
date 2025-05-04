import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class PrefTypeDTO {
  @IsNotEmpty()
  @ApiProperty()
  prefName: string;

  @IsNotEmpty()
  @ApiProperty()
  dataType: string;
}
