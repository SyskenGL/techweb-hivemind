export interface IAuthConfig {
  accessjwtSecret: string;
  accessjwtExpiration: number;
  refreshJwtSecret: string;
  refreshJwtExpiration: number;
  bcryptSaltRounds: number;
}
