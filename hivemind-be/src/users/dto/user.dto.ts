import { ApiProperty } from '@nestjs/swagger';
import { ProfileDto } from './profile.dto';
import { UserMetricDto } from './user-metric.dto';
import { UserRelationDto } from './user-relation.dto';

export class UserDto {
  @ApiProperty({
    description: 'Unique identifier of the user.',
    example: '0194dde4-2266-79ec-8a88-0da84cfb62fb'
  })
  readonly id: string;

  @ApiProperty({
    description: 'Username of the user.',
    example: 'john_doe'
  })
  readonly username: string;

  @ApiProperty({
    description: 'Email address of the user.',
    example: 'john.doe@example.com',
    nullable: true
  })
  readonly email?: string;

  @ApiProperty({
    description: 'Indicates whether the user is verified or not.',
    example: true
  })
  readonly verified: boolean;

  @ApiProperty({
    description: 'Date and time when the user was created.',
    example: '2023-08-24T14:15:22Z'
  })
  readonly createdAt: Date;

  @ApiProperty({
    description: 'Profile details of the user.',
    type: ProfileDto
  })
  readonly profile: ProfileDto;

  @ApiProperty({
    description: 'Metrics related to the user.',
    type: UserMetricDto
  })
  readonly metric: UserMetricDto;

  @ApiProperty({
    description: 'Relation details specific to the current user.',
    type: UserRelationDto,
    nullable: true
  })
  readonly relation?: UserRelationDto;
}
