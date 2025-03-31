import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  Mapper,
  MappingProfile,
  forMember,
  mapFrom
} from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';
import { VoteType } from '@prisma/client';
import { CommentMetric } from '@comments/types';
import { CommentMetricDto } from '@comments/dto';

@Injectable()
export class CommentMetricMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createTestMetadata();
  }

  createTestMetadata(): void {
    PojosMetadataMap.create<CommentMetric>('CommentMetric', {
      replies: Number,
      votes: Number,
      upVotes: Number
    });
    PojosMetadataMap.create<CommentMetricDto>('CommentMetricDto', {
      replies: Number,
      votes: Object
    });
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<CommentMetric, CommentMetricDto>(
        mapper,
        'CommentMetric',
        'CommentMetricDto',
        forMember((destination) => destination.votes, mapFrom(this.mapVotes))
      );
    };
  }

  private mapVotes(source: CommentMetric): { [key in VoteType]: number } {
    return {
      up: source.upVotes,
      down: source.votes - source.upVotes
    };
  }
}
