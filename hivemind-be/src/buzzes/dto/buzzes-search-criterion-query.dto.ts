import { BuzzesSearchCriterion } from '@buzzes/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class BuzzesSearchCriterionQueryDto {
  @IsEnum(BuzzesSearchCriterion)
  @IsOptional()
  @ApiProperty({
    description: `Specifies the criterion used to filter the buzzes.`,
    default: BuzzesSearchCriterion.CONTROVERSE,
    enum: BuzzesSearchCriterion,
    required: true
  })
  criterion: BuzzesSearchCriterion;

  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @ApiProperty({
    description: `List of values needed to perform the research.`,
    example: ['#tech', '#coding', '#buzz'],
    required: false,
    type: Array<String>
  })
  values?: string[];
}
