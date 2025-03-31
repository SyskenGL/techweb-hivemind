import { ApiProperty } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateVoteDto {
  readonly commentId: string;
  readonly voterId: string;

  @IsEnum(VoteType)
  @IsString()
  @ApiProperty({
    description: 'Type of the vote.',
    example: 'up'
  })
  readonly type: VoteType;
}
