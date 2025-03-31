import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CursorPaginationQueryDto {
  @Transform(({ value }) => Math.min(Math.max(1, value), 25))
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Number of items per page.',
    required: false
  })
  limit: number = 10;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description:
      'A string rappresenting the cursor used to fetch the next page of results.',
    required: false
  })
  cursor?: string;
}
