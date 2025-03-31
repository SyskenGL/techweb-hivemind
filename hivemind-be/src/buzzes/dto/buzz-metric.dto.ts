import { ApiProperty } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';

export class BuzzMetricDto {
  @ApiProperty({
    description: 'Total number of comments the buzz has received.',
    example: 43
  })
  readonly comments: number;

  @ApiProperty({
    description: 'Total number of views the buzz has accumulated.',
    example: 1000
  })
  readonly views: number;

  @ApiProperty({
    description:
      'Total number of votes the buzz has, categorized by vote type.',
    example: { up: 30, down: 5 }
  })
  readonly votes: { [key in VoteType]: number };
}
