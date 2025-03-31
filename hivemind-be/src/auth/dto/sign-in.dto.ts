import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Username or E-mail of the user attempting to sign in.',
    example: 'john_doe',
    required: true,
    nullable: false
  })
  readonly usernameOrEmail: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Password of the user attempting to sign in.',
    example: 'P@ssw0rd123!',
    required: true,
    nullable: false
  })
  readonly password: string;
}
