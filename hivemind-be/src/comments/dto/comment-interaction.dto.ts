import { ApiProperty } from '@nestjs/swagger';
import { VoteType } from '@prisma/client';

export class CommentInteractionDto {
  @ApiProperty({
    description:
      'Indicates the type of vote the current user has given to this comment.',
    example: VoteType.up,
    enum: VoteType
  })
  readonly vote: VoteType | null;

  @ApiProperty({
    description:
      'Indicates whether the current user is the author of this comment.',
    example: false
  })
  readonly authored: boolean;

  @ApiProperty({
    description: 'Indicates whether the current replied this comment.',
    example: false
  })
  readonly replied: boolean;
}
