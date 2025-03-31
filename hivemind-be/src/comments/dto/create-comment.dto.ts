import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { RemoveExtraNewlines } from '@common/helpers';

export class CreateCommentDto {
  readonly buzzId: string;
  readonly authorId: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'ID of the comment to which this comment is a reply.',
    example: '0194dde4-2266-79ec-8a88-0da84cfb62fb'
  })
  readonly parentCommentId: string;

  @RemoveExtraNewlines()
  @MaxLength(200)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Textual content of the comment.',
    example: 'Hello world, this is a comment!'
  })
  readonly content: string;
}
