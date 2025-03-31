import { MediaType } from '@media/enums';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AttachMediaDto {
  @IsEnum(MediaType)
  @ApiProperty({
    description: 'Media type of the file being attached.',
    enum: MediaType,
    required: true
  })
  readonly type: MediaType;

  @ApiProperty({
    description: 'ID of the media to be attached.',
    example: '0194dde4-2266-79ec-8a88-0da84cfb62fb',
    required: true
  })
  readonly id: string;
}
