import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '@auth/auth.service';
import { IJwtPayload } from '@auth/interfaces';
import { ExtractJwt, Strategy } from 'passport-jwt';
import authConfig from '@config/auth.config';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt'
) {
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: config.refreshJwtSecret
    });
  }

  validate(jwtPayload: IJwtPayload): Promise<IJwtPayload> {
    return this.authService.validateRefreshJwt(jwtPayload);
  }
}
