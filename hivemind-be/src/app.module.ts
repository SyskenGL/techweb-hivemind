import * as path from 'path';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerErrorInterceptor } from 'nestjs-pino';
import {
  AcceptLanguageResolver,
  I18nModule,
  I18nValidationPipe
} from 'nestjs-i18n';
import { validate } from '@config/env.validation';
import appConfig from '@config/app.config';
import { GlobalExceptionFilter } from '@common/filters';
import { AccessJwtAuthGuard } from '@auth/guards';
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@users/users.module';
import { MediaModule } from '@media/media.module';
import { BuzzesModule } from '@buzzes/buzzes.module';
import { SharedModule } from './shared/shared.module';
import { CommentsModule } from './comments/comments.module';
import { HashtagsModule } from './hashtags/hashtags.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      expandVariables: true,
      validate: validate
    }),
    ConfigModule.forFeature(appConfig),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/common/i18n/'),
        watch: true
      },
      resolvers: [AcceptLanguageResolver]
    }),
    SharedModule,
    AuthModule,
    UsersModule,
    MediaModule,
    BuzzesModule,
    CommentsModule,
    HashtagsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessJwtAuthGuard
    },
    {
      provide: APP_PIPE,
      useValue: new I18nValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        stopAtFirstError: true
      })
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerErrorInterceptor
    }
  ]
})
export class AppModule {}
