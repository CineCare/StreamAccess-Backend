import { ApiProperty } from '@nestjs/swagger';

export class CandidateEntity {
  @ApiProperty()
  id: number;

  @ApiProperty()
  pseudo: string;

  @ApiProperty()
  email?: string;
}
