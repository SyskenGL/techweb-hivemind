import { ApiProperty } from '@nestjs/swagger';

export class UserRelationDto {
  @ApiProperty({
    description: 'Indicates whether the current user follows this user.',
    example: true
  })
  readonly followed: boolean;
}
