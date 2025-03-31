import * as bcrypt from 'bcrypt';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import authConfig from '@config/auth.config';
import { ApiLocalizedException } from '@common/exceptions';
import { ISafeUser } from '@users/interfaces';
import { UsersService } from '@users/users.service';
import { SignUpDto, JwtPairDto } from './dto';
import { IJwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<JwtPairDto> {
    const { password, ...createUserDto } = signUpDto;
    const secret = await bcrypt.hash(
      signUpDto.password,
      this.config.bcryptSaltRounds
    );
    const user = await this.usersService.createUser({
      secret,
      ...createUserDto
    });
    return this.issueJwtPair(user.id);
  }

  async signIn(user: ISafeUser): Promise<JwtPairDto> {
    return this.issueJwtPair(user.id);
  }

  async signOut(jwtPayload: IJwtPayload): Promise<void> {
    const revocation = Math.floor(Date.now() / 1000);
    const ttl = (this.config.refreshJwtExpiration + 120) * 1000;
    await this.cache.set(`sub:${jwtPayload.sub}:revocation`, revocation, ttl);
  }

  async refresh(jwtPayload: IJwtPayload): Promise<JwtPairDto> {
    return this.issueJwtPair(jwtPayload.sub);
  }

  async validateUser(
    usernameOrEmail: string,
    password: string
  ): Promise<ISafeUser> {
    const user = await this.usersService
      .findUserByUsernameOrEmail(usernameOrEmail)
      .catch((error) => {
        throw new ApiLocalizedException(
          HttpStatus.UNAUTHORIZED,
          'auth.invalid-credentials'
        );
      });
    if (!(await bcrypt.compare(password, user.secret))) {
      throw new ApiLocalizedException(
        HttpStatus.UNAUTHORIZED,
        'auth.invalid-credentials'
      );
    }
    const { secret, ...rest } = user;
    return rest;
  }

  async validateRefreshJwt(jwtPayload: IJwtPayload): Promise<IJwtPayload> {
    const revocation = await this.cache.get<number>(
      `sub:${jwtPayload.sub}:revocation`
    );
    if (revocation && revocation > jwtPayload.iat!) {
      throw new ApiLocalizedException(
        HttpStatus.UNAUTHORIZED,
        'auth.revoked-jwt'
      );
    }
    return jwtPayload;
  }

  async issueJwtPair(sub: string): Promise<JwtPairDto> {
    return {
      accessToken: await this.jwtService.signAsync(
        { sub },
        {
          secret: this.config.accessjwtSecret,
          expiresIn: this.config.accessjwtExpiration
        }
      ),
      tokenType: 'bearer',
      expiresIn: this.config.accessjwtExpiration,
      refreshToken: await this.jwtService.signAsync(
        { sub },
        {
          secret: this.config.refreshJwtSecret,
          expiresIn: this.config.refreshJwtExpiration
        }
      )
    };
  }
}
