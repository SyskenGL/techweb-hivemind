import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength
} from 'class-validator';
import { IsValidAge } from '@common/validators';
import { RemoveExtraNewlines } from '@common/helpers';

export class UpdateProfileDto {
  readonly id: string;

  @IsString()
  @Matches(/^[\p{L}](?:[-.']?\s?[\p{L}])*$/u)
  @MaxLength(70)
  @IsOptional()
  @ApiProperty({
    description: 'Full name of the user.',
    example: 'John',
    required: false,
    nullable: true
  })
  readonly fullName?: string;

  @IsDate()
  @IsValidAge(18, 120)
  @IsOptional()
  @ApiProperty({
    description: 'Birthdate of the user.',
    example: '1990-05-15',
    required: false,
    nullable: true
  })
  readonly birthdate?: Date;

  @RemoveExtraNewlines()
  @MaxLength(300)
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Brief biography or description of the user.',
    example: 'Software developer with 10 years of experience.',
    required: false,
    nullable: true
  })
  readonly bio?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Unique identifier of the image used as profile picture.',
    example: '0194dde4-2266-79ec-8a88-0da84cfb62fb',
    required: false,
    nullable: true
  })
  readonly propicId?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Unique identifier of the image used as profile cover.',
    example: '0194dde4-2266-79ec-8a88-0da84cfb62fb',
    required: false,
    nullable: true
  })
  readonly coverId?: string;

  @Matches(/^https:\/\//)
  @MaxLength(200)
  @IsUrl()
  @IsOptional()
  @ApiProperty({
    description: "URL of the user's personal or professional website.",
    example: 'https://johndoe.com',
    required: false,
    nullable: true
  })
  readonly websiteUrl?: string;

  @Matches(/^https:\/\/(www\.)?(x|twitter)\.com\//)
  @MaxLength(200)
  @IsUrl()
  @IsOptional()
  @ApiProperty({
    description: "URL of the user's Twitter profile.",
    example: 'https://twitter.com/johndoe',
    required: false,
    nullable: true
  })
  readonly twitterUrl?: string;

  @Matches(/^https:\/\/(www\.)?linkedin\.com\/in\//)
  @MaxLength(200)
  @IsUrl()
  @IsOptional()
  @ApiProperty({
    description: "URL of the user's LinkedIn profile.",
    example: 'https://linkedin.com/in/johndoe',
    required: false,
    nullable: true
  })
  readonly linkedInUrl?: string;

  @Matches(/^https:\/\/(www\.)?facebook\.com\//)
  @MaxLength(200)
  @IsUrl()
  @IsOptional()
  @ApiProperty({
    description: "URL of the user's Facebook profile.",
    example: 'https://facebook.com/johndoe',
    required: false,
    nullable: true
  })
  readonly facebookUrl?: string;

  @Matches(/^https:\/\/(www\.)?instagram\.com\//)
  @MaxLength(200)
  @IsUrl()
  @IsOptional()
  @ApiProperty({
    description: "URL of the user's Instagram profile.",
    example: 'https://instagram.com/johndoe',
    required: false,
    nullable: true
  })
  readonly instagramUrl?: string;
}
