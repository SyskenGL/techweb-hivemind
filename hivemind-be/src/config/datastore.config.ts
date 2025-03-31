import { registerAs } from '@nestjs/config';
import { IDatastoreConfig } from './interfaces';

export default registerAs(
  'datastore-config',
  (): IDatastoreConfig => ({
    redisHost: process.env.DATASTORE_REDIS_HOST!,
    redisPort: +process.env.DATASTORE_REDIS_PORT!,
    minioHost: process.env.DATASTORE_MINIO_HOST!,
    minioPort: +process.env.DATASTORE_MINIO_PORT!,
    minioAccessKey: process.env.DATASTORE_MINIO_ACCESS_KEY!,
    minioSecretKey: process.env.DATASTORE_MINIO_SECRET_KEY!
  })
);
