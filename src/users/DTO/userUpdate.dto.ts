import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

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
}
