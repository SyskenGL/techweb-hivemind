import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SearchUserQueryDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: `Optional search term to filter users.`,
    required: false
  })
  search: string;
}
