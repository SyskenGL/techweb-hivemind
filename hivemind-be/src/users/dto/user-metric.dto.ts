import { ApiProperty } from '@nestjs/swagger';

export class UserMetricDto {
  @ApiProperty({
    description: 'Total number of followers the user has.',
    example: 1500
  })
  readonly followers: number;

  @ApiProperty({
    description: 'Total number of users this user is following.',
    example: 300
  })
  readonly followings: number;

  @ApiProperty({
    description: 'Total number of buzzes the user has created.',
    example: 75
  })
  readonly buzzes: number;
}
