import { MaxPlainTextLength } from '@common/validators';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttachMediaDto } from '@media/dto';
import { RemoveExtraNewlines, RemoveNewlines } from '@common/helpers';

export class CreateBuzzDto {
  readonly authorId: string;

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
  @ValidateNested({ each: true })
  @Type(() => AttachMediaDto)
  @IsOptional()
  @ApiProperty({
    description: 'Array of media IDs associated with the buzz.',
    example: [
      { type: 'image', id: '0194dde4-2266-79ec-8a88-0da84cfb62fb' },
      { type: 'image', id: '0194dde4-2266-79ec-8a88-0da84cfb62fb' }
    ],
    type: [AttachMediaDto],
    required: false
  })
  readonly media?: AttachMediaDto[];
}
