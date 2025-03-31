import { ApiProperty } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';

export class BuzzInteractionDto {
  @ApiProperty({
    description:
      'Indicates the type of vote the current user has given to this buzz.',
    example: VoteType.up,
    enum: VoteType
  })
  readonly vote: VoteType | null;

  @ApiProperty({
    description: 'Indicates the number of comments of the user on this buzz.',
    example: 3
  })
  readonly comments: number;

  @ApiProperty({
    description:
      'Indicates whether the current user is the author of this buzz.',
    example: false
  })
  readonly authored: boolean;

  @ApiProperty({
    description: 'Indicates whether the current user bookmarked this buzz.',
    example: false
  })
  readonly bookmarked: boolean;
}
