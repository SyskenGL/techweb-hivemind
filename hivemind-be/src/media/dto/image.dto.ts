import { ApiProperty } from '@nestjs/swagger';

export class ImageDto {
  @ApiProperty({
    description: 'Unique identifier for the media',
    example: '0194dde4-2266-79ec-8a88-0da84cfb62fb'
  })
  readonly id: string;

  @ApiProperty({
    description: 'Name of the file.',
    example: '0194dde4-2266-79ec-8a88-0da84cfb62fb.jpeg'
  })
  readonly filename: string;

  @ApiProperty({
    description: 'Format of the image',
    example: 'jpeg'
  })
  readonly format: string;

  @ApiProperty({
    description: 'Size of the image in bytes',
    example: 102400
  })
  readonly size: number;

  @ApiProperty({
    description: 'Width of the image in pixels.',
    example: 1920
  })
  readonly width: number;

  @ApiProperty({
    description: 'Height of the image in pixels',
    example: 1080
  })
  readonly height: number;

  @ApiProperty({
    description: 'Date when the media was uploaded',
    example: '2024-08-28T12:34:56.789Z'
  })
  readonly uploadedAt: Date;
}
