import { ApiProperty } from '@nestjs/swagger';
import { PrefEntity } from './prefs.entity';

export class MineUserEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  pseudo: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  prefs: PrefEntity[];
}
