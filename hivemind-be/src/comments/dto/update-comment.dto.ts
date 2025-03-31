import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { RemoveExtraNewlines } from '@common/helpers';

export class UpdateCommentDto {
  readonly id: string;

  @RemoveExtraNewlines()
  @MaxLength(200)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The textual content of the comment.',
    example: 'Hello world, this is a comment!'
  })
  readonly content: string;
}
