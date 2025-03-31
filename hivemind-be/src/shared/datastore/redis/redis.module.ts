import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import datastoreConfig from '@config/datastore.config';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule.forFeature(datastoreConfig)],
      useFactory: async (config: ConfigType<typeof datastoreConfig>) => {
        const store = await redisStore({
          socket: { host: config.redisHost, port: config.redisPort }
        });
        return {
          store: () => store
        };
      },
      inject: [datastoreConfig.KEY]
    })
  ],
  exports: [CacheModule]
})
export class RedisModule {}
