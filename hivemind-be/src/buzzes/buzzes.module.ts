import { Module } from '@nestjs/common';
import { MediaModule } from '@media/media.module';
import { UsersModule } from '@users/users.module';
import { BuzzesService } from './buzzes.service';
import { BuzzesController } from './buzzes.controller';

@Module({
  imports: [MediaModule, UsersModule],
  providers: [BuzzesService],
  controllers: [BuzzesController],
  exports: [BuzzesService]
})
export class BuzzesModule {}
