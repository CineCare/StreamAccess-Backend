import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateProducerDTO {
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @ApiProperty()
  biography?: string;
}
