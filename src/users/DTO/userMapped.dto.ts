import { ApiProperty } from '@nestjs/swagger';

export class UserMappedDTO {
  @ApiProperty()
  id: number;

  @ApiProperty()
  pseudo: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  isActive?: boolean;

  @ApiProperty()
  prefs?: any;
}
