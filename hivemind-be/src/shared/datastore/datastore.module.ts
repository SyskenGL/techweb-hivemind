import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { MinioModule } from './minio/minio.module';

@Module({
  imports: [PrismaModule, RedisModule, MinioModule],
  exports: [PrismaModule, RedisModule, MinioModule]
})
export class DatastoreModule {}
