import { ApiProperty } from '@nestjs/swagger';
import { MediaDto } from '@media/dto';
import { UserPreviewDto } from '@users/dto';
import { BuzzInteractionDto, BuzzMetricDto } from '.';

export class BuzzDto {
  @ApiProperty({
    description: 'Unique identifier of the buzz.',
    example: '0194dde4-2266-79ec-8a88-0da84cfb62fb'
  })
  readonly id: string;

  @ApiProperty({
    description: 'Essential information about the author of the buzz',
    type: () => UserPreviewDto
  })
  readonly author: UserPreviewDto;

  @ApiProperty({
    description: 'Title of the buzz.',
    example: 'Breaking News: Hivemind is here!'
  })
  readonly title: string;

  @ApiProperty({
    description: 'Content (body) of the buzz.',
    example: 'Hello world, this is a buzz! ... #buzz #hivemind'
  })
  readonly content: string;

  @ApiProperty({
    description: 'Date and time when the buzz was created.',
    example: '2024-09-01T12:34:56Z'
  })
  readonly createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the buzz was last updated.',
    example: '2024-09-02T14:22:30Z'
  })
  readonly updatedAt: Date;

  @ApiProperty({
    description: 'Media items associated with the buzz.',
    type: [MediaDto]
  })
  readonly media: MediaDto[];

  @ApiProperty({
    description: 'Metrics related to the buzz.'
  })
  readonly metric: BuzzMetricDto;

  @ApiProperty({
    description: 'Interaction details specific to the current user.'
  })
  readonly interaction: BuzzInteractionDto;
}
