import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import * as path from 'path';
import { v4 } from 'uuid';
import loggerConfig from '@config/logger.config';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule.forFeature(loggerConfig)],
      useFactory: async (config: ConfigType<typeof loggerConfig>) => {
        return {
          pinoHttp: {
            enabled: config.enabled,
            level: config.level,
            genReqId: (request) => request.headers['x-correlation-id'] || v4(),
            autoLogging: config.autoLogging,
            quietReqLogger: true,
            redact: ['req.body.password'],

            transport: {
              targets: (() => {
                const targets: any = [
                  config.prettify
                    ? {
                        target: 'pino-pretty',
                        options: {
                          colorize: true,
                          singleLine: true,
                          translateTime: 'yyyy-mm-dd HH:MM:ss.l o'
                        }
                      }
                    : {
                        target: 'pino/file',
                        options: {
                          destination: 1
                        }
                      }
                ];
                if (config.logFilePath) {
                  targets.push({
                    target: 'pino-roll',
                    options: {
                      file: path.join(
                        config.logFilePath,
                        `${config.logFilePrefix}`
                      ),
                      extension: 'log',
                      frequency: config.logFileInterval,
                      dateFormat: 'yyyy-MM-dd',
                      size: config.logFileMaxSize,
                      mkdir: true,
                      limit: { count: config.logFileRetention }
                    }
                  });
                }
                return targets;
              })()
            },

            serializers: {
              req: (request) => ({
                id: request.id,
                method: request.method,
                url: request.url,
                params: request.params,
                query: request.query,
                body: request.raw.body
              }),
              res: (response) => ({
                statusCode: response.statusCode
              })
            },

            customLogLevel: function (request, response, error) {
              if (error || response.statusCode >= 500) return 'error';
              if (response.statusCode >= 400) return 'warn';
              return 'info';
            },

            customSuccessMessage: function (request, response) {
              return `Request completed with status code ${response.statusCode}:`;
            },

            customReceivedMessage: function (request, response) {
              return `${request.method} request received on ${request.url}:`;
            },

            customErrorMessage: function (request, response, error) {
              return `Request errored with status code ${response.statusCode}:`;
            }
          }
        };
      },
      inject: [loggerConfig.KEY]
    })
  ]
})
export class LoggerModule {}
