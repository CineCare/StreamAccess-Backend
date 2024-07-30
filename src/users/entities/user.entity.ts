import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  pseudo: string;

  @ApiProperty()
  email?: string;
}
