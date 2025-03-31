import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Refresh token used to obtain a new access token.',
    example: 'eyJhbGciOiJIUzI1Ni...'
  })
  readonly refreshToken: string;
}
