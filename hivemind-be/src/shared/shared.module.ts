import { Global, Module } from '@nestjs/common';
import { DatastoreModule } from '@datastore/datastore.module';
import { LoggerModule } from '@logger/logger.module';
import { MapperModule } from './mapper/mapper.module';

@Global()
@Module({
  imports: [DatastoreModule, LoggerModule, MapperModule],
  exports: [DatastoreModule, LoggerModule]
})
export class SharedModule {}
