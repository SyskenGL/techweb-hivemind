export interface IAppConfig {
  port: number;
  globalPrefix?: string;
  globalVersion?: string;
  swaggerPath: string;
  swaggerTitle: string;
  swaggerDescription?: string;
  swaggerVersion: string;
}
