import { registerAs } from '@nestjs/config';
import { ILoggerConfig } from './interfaces';

export default registerAs(
  'logger-config',
  (): ILoggerConfig => ({
    enabled: JSON.parse(process.env.LOGGER_ENABLED ?? 'true'),
    level: process.env.LOGGER_LEVEL || 'info',
    prettify: JSON.parse(process.env.LOGGER_PRETTIFY ?? 'false'),
    autoLogging: JSON.parse(process.env.LOGGER_AUTO_LOGGING ?? 'false'),
    logFilePrefix: process.env.LOGGER_LOG_FILE_PREFIX ?? '',
    logFilePath: process.env.LOGGER_LOG_FILE_PATH,
    logFileWriteSync: JSON.parse(
      process.env.LOGGER_LOG_FILE_WRITE_SYNC ?? 'false'
    ),
    logFileWriteBuffer: Number(process.env.LOGGER_LOG_FILE_WRITE_BUFFER) || 0,
    logFileRetention: Number(process.env.LOGGER_LOG_FILE_RETENTION) || 5,
    logFileInterval: process.env.LOGGER_LOG_FILE_INTERVAL ?? '1d',
    logFileMaxSize: process.env.LOGGER_LOG_FILE_MAX_SIZE ?? '15m'
  })
);
