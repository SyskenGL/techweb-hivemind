import { IsPath } from '@common/validators';
import { plainToInstance } from 'class-transformer';
import {
  IsBooleanString,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsPort,
  IsString,
  Matches,
  validateSync
} from 'class-validator';

class Environment {
  @IsPort()
  @IsOptional()
  APP_PORT: string | number;

  @IsString()
  @IsOptional()
  APP_GLOBAL_PREFIX: string;

  @IsNumberString()
  @IsOptional()
  APP_GLOBAL_VERSION: string;

  @IsString()
  @IsOptional()
  APP_SWAGGER_PATH: string;

  @IsString()
  @IsOptional()
  APP_SWAGGER_TITLE: string;

  @IsString()
  @IsOptional()
  APP_SWAGGER_DESCRIPTION: string;

  @IsNumberString()
  @IsOptional()
  APP_SWAGGER_VERSION: string;

  @IsBooleanString()
  @IsOptional()
  LOGGER_ENABLED: string;

  @IsString()
  @Matches(/^(trace|debug|info|warn|error|fatal)$/)
  @IsOptional()
  LOGGER_LEVEL: string;

  @IsBooleanString()
  @IsOptional()
  LOGGER_PRETTIFY: string;

  @IsBooleanString()
  @IsOptional()
  LOGGER_AUTO_LOGGING: string;

  @IsPath()
  @IsOptional()
  LOGGER_LOG_FILE_PATH: string;

  @IsBooleanString()
  @IsOptional()
  LOGGER_LOG_FILE_WRITE_SYNC: string;

  @IsNumberString()
  @IsOptional()
  LOGGER_LOG_FILE_RETENTION: string;

  @Matches(/^(hourly|daily)$/)
  @IsOptional()
  LOGGER_LOG_FILE_INTERVAL: string;

  @Matches(/^\d+(k|m|g)$/i)
  @IsOptional()
  LOGGER_LOG_FILE_MAX_SIZE: string;

  @IsString()
  @IsNotEmpty()
  DATASTORE_DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  DATASTORE_REDIS_HOST: string;

  @IsNotEmpty()
  @IsPort()
  DATASTORE_REDIS_PORT: string | number;

  @IsString()
  @IsNotEmpty()
  DATASTORE_MINIO_HOST: string;

  @IsPort()
  @IsNotEmpty()
  DATASTORE_MINIO_PORT: string | number;

  @IsString()
  @IsNotEmpty()
  DATASTORE_MINIO_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  DATASTORE_MINIO_SECRET_KEY: string;

  @IsString()
  @IsNotEmpty()
  AUTH_ACCESS_JWT_SECRET: string;

  @IsNumber()
  @IsNotEmpty()
  AUTH_ACCESS_JWT_EXPIRATION: number;

  @IsString()
  @IsNotEmpty()
  AUTH_REFRESH_JWT_SECRET: string;

  @IsNumber()
  @IsNotEmpty()
  AUTH_REFRESH_JWT_EXPIRATION: number;

  @IsNumber()
  @IsNotEmpty()
  AUTH_BCRYPT_SALT_ROUNDS: number;
}

export function validate(config: Record<string, unknown>) {
  const validation = plainToInstance(Environment, config, {
    enableImplicitConversion: true
  });
  const errors = validateSync(validation, {
    skipMissingProperties: false
  });
  if (errors.length > 0) {
    const errorMessages = errors
      .flatMap((err) => Object.values(err.constraints ?? {}).map((msg) => msg))
      .join('; ');
    throw new Error(`Validation failed: ${errorMessages}`);
  }
  return validation;
}
