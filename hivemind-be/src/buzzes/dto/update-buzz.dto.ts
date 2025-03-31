import { MaxPlainTextLength } from '@common/validators';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';
import { AttachMediaDto } from '@media/dto';
import { RemoveExtraNewlines, RemoveNewlines } from '@common/helpers';

export class UpdateBuzzDto {
  readonly id: string;

  @RemoveNewlines()
  @MaxLength(70)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Title of the buzz.',
    example: 'Breaking News: Hivemind is here!'
  })
  readonly title: string;

  @RemoveExtraNewlines()
  @MaxPlainTextLength(400)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Content (body) of the buzz.',
    example: 'Hello world, this is a buzz! ... #buzz #hivemind'
  })
  readonly content: string;

  @ArrayMaxSize(5)
  @IsArray()
  @IsOptional()
  @ApiProperty({
    description: 'Array of media IDs associated with the buzz.',
    example: [
      { type: 'image', id: 1 },
      { type: 'image', id: 2 }
    ],
    type: [AttachMediaDto],
    required: false
  })
  readonly media?: AttachMediaDto[];
}
