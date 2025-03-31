import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  Mapper,
  MappingProfile,
  forMember,
  mapWith
} from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';
import { HydratedComment } from '@comments/types';
import { CommentDto } from '@comments/dto';

@Injectable()
export class CommentMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createTestMetadata();
  }

  createTestMetadata(): void {
    PojosMetadataMap.create<HydratedComment>('Comment', {
      id: String,
      author: 'PartialUser',
      buzzId: String,
      parentCommentId: String,
      content: String,
      createdAt: Date,
      updatedAt: Date,
      _count: 'CommentMetric',
      interaction: Object
    });
    PojosMetadataMap.create<CommentDto>('CommentDto', {
      id: String,
      author: 'UserPreviewDto',
      buzzId: String,
      parentCommentId: String,
      content: String,
      createdAt: Date,
      updatedAt: Date,
      metric: 'CommentMetricDto',
      interaction: Object
    });
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<HydratedComment, CommentDto>(
        mapper,
        'Comment',
        'CommentDto',
        forMember(
          (destination) => destination.author,
          mapWith('UserPreviewDto', 'PartialUser', (source) => source.author)
        ),
        forMember(
          (destination) => destination.metric,
          mapWith(
            'CommentMetricDto',
            'CommentMetric',
            (source) => source._count
          )
        )
      );
    };
  }
}
