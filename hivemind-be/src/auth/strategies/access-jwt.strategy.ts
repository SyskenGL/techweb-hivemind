import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IJwtPayload } from '@auth/interfaces';
import { ExtractJwt, Strategy } from 'passport-jwt';
import authConfig from '@config/auth.config';

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(
  Strategy,
  'access-jwt'
) {
  constructor(
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.accessjwtSecret
    });
  }

  validate(jwtPayload: IJwtPayload): IJwtPayload {
    return jwtPayload;
  }
}
