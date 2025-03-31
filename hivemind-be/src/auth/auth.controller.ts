import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { ISafeUser } from '@users/interfaces';
import { AuthService } from './auth.service';
import { RefreshDto, SignInDto, SignUpDto, JwtPairDto } from './dto';
import { IJwtPayload } from './interfaces';
import { GetJwtPayload, GetSafeUser, Public } from './decorators';
import { LocalAuthGuard, RefreshJwtAuthGuard } from './guards';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiOperation({
    summary: 'Authenticates the user and returns a JWT pair.'
  })
  @ApiBody({ type: SignInDto })
  @ApiOkResponse({ type: JwtPairDto })
  async signIn(@GetSafeUser() user: ISafeUser): Promise<JwtPairDto> {
    return this.authService.signIn(user);
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @Public()
  @ApiOperation({ summary: 'Registers a new user with provided credentials.' })
  @ApiBody({ type: SignUpDto })
  async signUp(@Body() signUpDto: SignUpDto): Promise<JwtPairDto> {
    return await this.authService.signUp(signUpDto);
  }

  @Post('signout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Revokes all refresh tokens issued prior to the current operation.'
  })
  @ApiBearerAuth()
  async signOut(@GetJwtPayload() jwtPayload: IJwtPayload): Promise<void> {
    await this.authService.signOut(jwtPayload);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Public()
  @UseGuards(RefreshJwtAuthGuard)
  @ApiOperation({
    summary: 'Refreshes the JWT pair using a valid refresh token.'
  })
  @ApiBody({ type: RefreshDto })
  @ApiOkResponse({ type: JwtPairDto })
  async refresh(@GetJwtPayload() jwtPayload: IJwtPayload): Promise<JwtPairDto> {
    return this.authService.refresh(jwtPayload);
  }
}
