import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { BuzzesModule } from '@buzzes/buzzes.module';

@Module({
  imports: [BuzzesModule],
  controllers: [CommentsController],
  providers: [CommentsService]
})
export class CommentsModule {}
