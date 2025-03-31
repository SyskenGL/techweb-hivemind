import { registerAs } from '@nestjs/config';
import { IAppConfig } from './interfaces';

export default registerAs(
  'app-config',
  (): IAppConfig => ({
    port: Number(process.env.APP_PORT) || 3000,
    globalPrefix: process.env.APP_GLOBAL_PREFIX,
    globalVersion: process.env.APP_GLOBAL_VERSION,
    swaggerPath: process.env.APP_SWAGGER_PATH || 'api-docs',
    swaggerTitle: process.env.APP_SWAGGER_TITLE || 'APIs Documentation',
    swaggerDescription: process.env.APP_SWAGGER_DESCRIPTION,
    swaggerVersion: process.env.APP_SWAGGER_VERSION || '1.0'
  })
);
