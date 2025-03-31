import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import datastoreConfig from '@config/datastore.config';
import { NestMinioModule } from 'nestjs-minio';

@Module({
  imports: [
    NestMinioModule.registerAsync({
      imports: [ConfigModule.forFeature(datastoreConfig)],
      useFactory: async (config: ConfigType<typeof datastoreConfig>) => ({
        endPoint: config.minioHost,
        port: config.minioPort,
        useSSL: false,
        accessKey: config.minioAccessKey,
        secretKey: config.minioSecretKey
      }),
      inject: [datastoreConfig.KEY]
    })
  ],
  exports: [NestMinioModule]
})
export class MinioModule {}
