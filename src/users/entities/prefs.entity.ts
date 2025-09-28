import { ApiProperty } from '@nestjs/swagger';

export class PrefEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  theme?: string;

  @ApiProperty()
  images?: boolean;

  @ApiProperty()
  audio?: boolean;

  @ApiProperty()
  helpLevel?: number;

  @ApiProperty()
  value: string;

  @ApiProperty()
  profileName: string;

  @ApiProperty()
  userId: number;
}
