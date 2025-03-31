import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { Module } from '@nestjs/common';
import {
  BuzzMetricMapping,
  BuzzCreateMapping,
  BuzzMapping,
  BuzzUpdateMapping,
  CommentMetricMapping,
  CommentCreateMapping,
  CommentMapping,
  CommentUpdateMapping,
  ImageMapping,
  UserMetricMapping,
  UserCreateMapping,
  UserPreviewMapping,
  UserMapping,
  UserProfileMapping,
  UserProfileUpdateMapping
} from './mappings';

@Module({
  imports: [
    AutomapperModule.forRoot({
      strategyInitializer: pojos()
    })
  ],
  providers: [
    UserMapping,
    UserMetricMapping,
    UserCreateMapping,
    UserProfileMapping,
    UserProfileUpdateMapping,
    ImageMapping,
    BuzzMapping,
    BuzzMetricMapping,
    BuzzCreateMapping,
    BuzzUpdateMapping,
    UserPreviewMapping,
    CommentMapping,
    CommentMetricMapping,
    CommentCreateMapping,
    CommentUpdateMapping
  ]
})
export class MapperModule {}
