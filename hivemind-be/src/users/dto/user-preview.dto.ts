import { ApiProperty } from '@nestjs/swagger';
import { UserRelationDto } from '@users/dto';

export class UserPreviewDto {
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
    description: 'Full name of the user.',
    example: 'John'
  })
  readonly fullName: string;

  @ApiProperty({
    description: 'Indicates whether the user is verified or not.',
    example: true
  })
  readonly verified: boolean;

  @ApiProperty({
    description: "Unique identifier of the user's profile picture.",
    example: '379f37a94e6e4bf98f7c59b2675806b8',
    nullable: true
  })
  readonly propicId: string | null;

  @ApiProperty({
    description: 'Relation details specific to the current user.',
    type: UserRelationDto,
    nullable: true
  })
  readonly relation?: UserRelationDto;
}
