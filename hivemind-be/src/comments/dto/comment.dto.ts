import { ApiProperty } from '@nestjs/swagger';
import { UserPreviewDto } from '@users/dto';
import { CommentMetricDto } from './comment-metric.dto';
import { CommentInteractionDto } from './comment-interaction.dto';

export class CommentDto {
  @ApiProperty({
    description: 'Unique identifier of the comment.',
    example: '0194dde4-2266-79ec-8a88-0da84cfb62fb'
  })
  readonly id: string;

  @ApiProperty({
    description: 'Unique identifier of the comment.',
    example: '0194dde4-2266-79ec-8a88-0da84cfb62fb'
  })
  readonly buzzId: string;

  @ApiProperty({
    description: 'Essential information about the author of the comment',
    type: () => UserPreviewDto
  })
  readonly author: UserPreviewDto;

  @ApiProperty({
    description: 'Unique identifier of the comment.',
    example: '0194dde4-2266-79ec-8a88-0da84cfb62fb',
    nullable: true
  })
  readonly parentCommentId: string;

  @ApiProperty({
    description: 'The textual content of the comment.',
    example: 'Hello world, this is a comment!'
  })
  readonly content: string;

  @ApiProperty({
    description: 'Date and time when the comment was created.',
    example: '2024-09-01T12:34:56Z'
  })
  readonly createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the comment was last updated.',
    example: '2024-09-02T14:22:30Z'
  })
  readonly updatedAt: Date;

  @ApiProperty({
    description: 'Metrics related to the comment.'
  })
  readonly metric: CommentMetricDto;

  @ApiProperty({
    description: 'Interaction details specific to the current user.'
  })
  readonly interaction: CommentInteractionDto;
}
