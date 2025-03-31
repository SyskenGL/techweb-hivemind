import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '@auth/auth.service';
import { Strategy } from 'passport-local';
import { ISafeUser } from '@users/interfaces';

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'usernameOrEmail', passReqToCallback: false });
  }

  validate(usernameOrEmail: string, password: string): Promise<ISafeUser> {
    return this.authService.validateUser(usernameOrEmail, password);
  }
}
