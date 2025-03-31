import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
  MaxLength
} from 'class-validator';
import { IsValidAge } from '@common/validators';
import { ToLowercase, Capitalize } from '@common/helpers';

export class SignUpDto {
  @ToLowercase()
  @Matches(/^(?=.*[a-zA-Z0-9])(?!.*[._]{2})[a-zA-Z0-9._]+$/)
  @MaxLength(20)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Username of the user signing up.',
    example: 'john_doe',
    required: true,
    nullable: false
  })
  readonly username: string;

  @IsEmail()
  @MaxLength(255)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email address of the user.',
    example: 'john.doe@example.com',
    required: true,
    nullable: false
  })
  readonly email: string;

  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
    minLowercase: 1
  })
  @IsNotEmpty()
  @ApiProperty({
    description: 'Password for the user account.',
    example: 'P@ssw0rd123!',
    required: true,
    nullable: false
  })
  readonly password: string;

  @Capitalize()
  @Matches(/^[\p{L}](?:[-.']?\s?[\p{L}])*$/u)
  @MaxLength(70)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Full name of the user.',
    example: 'John Doe',
    required: true,
    nullable: false
  })
  readonly fullName: string;

  @IsValidAge(18, 120)
  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Birthdate of the user.',
    example: '1990-10-14',
    required: true,
    nullable: false
  })
  readonly birthdate: Date;
}
