import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty({
    description: 'Full name of the user.',
    example: 'John'
  })
  readonly fullName: string;

  @ApiProperty({
    description: 'Birthdate of the user.',
    example: '1990-05-15'
  })
  readonly birthdate: Date;

  @ApiProperty({
    description: 'Brief biography or description of the user.',
    example: 'Software developer with 10 years of experience.',
    nullable: true
  })
  readonly bio: string | null;

  @ApiProperty({
    description: "Unique identifier of the user's profile picture.",
    example: '0194dde4-2266-79ec-8a88-0da84cfb62fb',
    nullable: true
  })
  readonly propicId: string | null;

  @ApiProperty({
    description: "Unique identifier of the user's cover.",
    example: '0194dde4-2266-79ec-8a88-0da84cfb62fb',
    nullable: true
  })
  readonly coverId: string | null;

  @ApiProperty({
    description: "URL of the user's personal or professional website.",
    example: 'https://johndoe.com',
    nullable: true
  })
  readonly websiteUrl: string | null;

  @ApiProperty({
    description: "URL of the user's Twitter profile.",
    example: 'https://twitter.com/johndoe',
    nullable: true
  })
  readonly twitterUrl: string | null;

  @ApiProperty({
    description: "URL of the user's LinkedIn profile.",
    example: 'https://linkedin.com/johndoe',
    nullable: true
  })
  readonly linkedInUrl: string | null;

  @ApiProperty({
    description: "URL of the user's Facebook profile.",
    example: 'https://facebook.com/johndoe',
    nullable: true
  })
  readonly facebookUrl: string | null;

  @ApiProperty({
    description: "URL of the user's Instagram profile.",
    example: 'https://instagram.com/johndoe',
    nullable: true
  })
  readonly instagramUrl: string | null;

  @ApiProperty({
    description: 'Last date and time when the profile was updated.',
    example: '2023-08-24T14:15:22Z',
    nullable: true
  })
  readonly updatedAt: Date | null;
}
