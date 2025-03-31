export interface ILoggerConfig {
  enabled: boolean;
  level: string;
  prettify: boolean;
  autoLogging: boolean;
  logFilePath?: string;
  logFilePrefix: string;
  logFileWriteSync: boolean;
  logFileWriteBuffer: number;
  logFileRetention: number;
  logFileInterval: string;
  logFileMaxSize: string;
}
