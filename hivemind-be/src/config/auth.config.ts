import { registerAs } from '@nestjs/config';
import { IAuthConfig } from './interfaces';

export default registerAs(
  'auth-config',
  (): IAuthConfig => ({
    accessjwtSecret: process.env.AUTH_ACCESS_JWT_SECRET!,
    accessjwtExpiration: +process.env.AUTH_ACCESS_JWT_EXPIRATION!,
    refreshJwtSecret: process.env.AUTH_REFRESH_JWT_SECRET!,
    refreshJwtExpiration: +process.env.AUTH_REFRESH_JWT_EXPIRATION!,
    bcryptSaltRounds: +process.env.AUTH_BCRYPT_SALT_ROUNDS!
  })
);
