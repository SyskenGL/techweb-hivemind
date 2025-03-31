import { ApiProperty } from '@nestjs/swagger';
import { MediaType } from '@media/enums';
import { IsEnum } from 'class-validator';

export class MediaDto {
  @ApiProperty({
    description: 'Unique identifier of the media.'
  })
  readonly id: string;

  @IsEnum(MediaType)
  @ApiProperty({
    description: 'Media type of the file.',
    enum: MediaType
  })
  readonly type: MediaType;
}
