import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PrefDTO } from '../../commons/utils/prefsHandler';

export class UpdateUserDTO {
  @IsNotEmpty()
  @ApiProperty()
  pseudo?: string;

  @IsNotEmpty()
  @ApiProperty()
  actualPassword?: string;

  @IsNotEmpty()
  @ApiProperty()
  newPassword?: string;

  @IsNotEmpty()
  @ApiProperty()
  newPasswordConfirm?: string;

  @IsNotEmpty()
  @ApiProperty()
  prefs?: PrefDTO[];
}
