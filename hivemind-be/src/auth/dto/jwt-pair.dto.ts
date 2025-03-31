import { ApiProperty } from '@nestjs/swagger';

export class JwtPairDto {
  @ApiProperty({
    description: 'Access token used for authenticating requests.',
    example: 'eyJhbGciOiJIUzI1Ni...'
  })
  readonly accessToken: string;

  @ApiProperty({
    description: 'Type of the token, typically "Bearer".',
    example: 'bearer'
  })
  readonly tokenType: string;

  @ApiProperty({
    description: 'Number of seconds until the access token expires.',
    example: 300
  })
  readonly expiresIn: number;

  @ApiProperty({
    description: 'Refresh token used to obtain a new access token.',
    example: 'eyJhbGciOiJIUzI1Ni...'
  })
  readonly refreshToken: string;
}
