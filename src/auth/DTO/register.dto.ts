import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { PrefDTO } from '../../commons/utils/prefsHandler';

export class RegisterDTO {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @ApiProperty()
  pseudo: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  // NOSONAR
  @Matches(
    /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^a-zA-Z0-9\s])([^\s]){8,16}$/gm,
    {
      message: 'Mot de passe trop faible',
    },
  )
  @ApiProperty()
  password: string;

  @ApiProperty()
  prefs?: PrefDTO[];
}
