import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PrefDTO } from '../../commons/utils/prefsHandler';

export class UpdateUserDTO {
  @IsNotEmpty()
  @ApiProperty()
  pseudo?: string;

  @IsString()
  @ApiProperty()
  avatar?: string;

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
  @ApiProperty({
    description: 'preferences to update, as a stringified PrefDTO array',
    example: '[{"name":"theme","value":"default","profileName":"default"}]',
    type: 'string',
  })
  prefs?: PrefDTO[];
}
