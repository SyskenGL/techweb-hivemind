import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { IAppConfig } from '@config/interfaces';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*', exposedHeaders: ['location'] });
  app.useLogger(app.get(Logger));
  const configService = app.get(ConfigService);
  const appConfig = configService.get<IAppConfig>('app-config')!;
  if (appConfig.globalPrefix) {
    app.setGlobalPrefix(appConfig.globalPrefix);
  }
  appConfig.globalVersion &&
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: appConfig.globalVersion
    });
  const options = new DocumentBuilder()
    .setTitle(appConfig.swaggerTitle)
    .setDescription(appConfig.swaggerDescription ?? '')
    .setVersion(appConfig.swaggerVersion)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(appConfig.swaggerPath, app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 }
  });
  await app.listen(appConfig.port, '0.0.0.0');
}
bootstrap();
