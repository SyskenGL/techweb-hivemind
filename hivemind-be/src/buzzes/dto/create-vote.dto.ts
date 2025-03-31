import { ApiProperty } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CreateVoteDto {
  readonly buzzId: string;
  readonly voterId: string;

  @IsEnum(VoteType)
  @ApiProperty({
    description: 'Type of the vote.',
    example: 'up'
  })
  readonly type: VoteType;
}
