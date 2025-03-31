import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import authConfig from '@config/auth.config';
import { UsersModule } from '@users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  AccessJwtStrategy,
  LocalAuthStrategy,
  RefreshJwtStrategy
} from './strategies';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    JwtModule.register({}),
    PassportModule,
    UsersModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalAuthStrategy,
    AccessJwtStrategy,
    RefreshJwtStrategy
  ]
})
export class AuthModule {}
