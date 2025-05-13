import { ApiProperty } from '@nestjs/swagger';
import { PrefDTO } from '../../commons/utils/prefsHandler';

export class UserEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  pseudo: string;

  @ApiProperty()
  avatar?: string;

  @ApiProperty()
  email?: string;

  @ApiProperty()
  isActive?: boolean;

  @ApiProperty()
  prefs?: PrefDTO[];
}
