import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  forMember,
  MappingProfile,
  mapFrom,
  Mapper
} from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';
import { BuzzMetric } from '@buzzes/types';
import { BuzzMetricDto } from '@buzzes/dto';
import { VoteType } from '@prisma/client';

@Injectable()
export class BuzzMetricMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createTestMetadata();
  }

  createTestMetadata(): void {
    PojosMetadataMap.create<BuzzMetric>('BuzzMetric', {
      comments: Number,
      votes: Number,
      upVotes: Number
    });
    PojosMetadataMap.create<BuzzMetricDto>('BuzzMetricDto', {
      comments: Number,
      votes: Object
    });
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<BuzzMetric, BuzzMetricDto>(
        mapper,
        'BuzzMetric',
        'BuzzMetricDto',
        forMember((destination) => destination.votes, mapFrom(this.mapVotes))
      );
    };
  }

  private mapVotes(source: BuzzMetric): { [key in VoteType]: number } {
    return {
      up: source.upVotes,
      down: source.votes - source.upVotes
    };
  }
}
