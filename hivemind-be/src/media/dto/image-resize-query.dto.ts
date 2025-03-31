import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Fit } from '@media/enums';

export class ImageResizeQueryDto {
  @IsOptional()
  @ApiProperty({
    description:
      'Desired image width in pixels. Defaults to original if not set.',
    required: false
  })
  width?: number;

  @IsOptional()
  @ApiProperty({
    description:
      'Desired image height in pixels. Defaults to original if not set.',
    required: false
  })
  height?: number;

  @IsEnum(Fit)
  @IsOptional()
  @ApiProperty({
    description: `Resize strategy to apply.`,
    enum: Fit,
    required: false
  })
  fit?: string;
}
