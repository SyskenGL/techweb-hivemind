import { ApiProperty } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';

export class CommentMetricDto {
  @ApiProperty({
    description: 'Total number of replies the comment has received.',
    example: 43
  })
  readonly replies: number;

  @ApiProperty({
    description:
      'Total number of votes the comment has, categorized by vote type.',
    example: { up: 30, down: 5 }
  })
  readonly votes: { [key in VoteType]: number };
}
