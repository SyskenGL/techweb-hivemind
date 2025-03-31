import { Module } from '@nestjs/common';
import { MediaModule } from '@media/media.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [MediaModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
