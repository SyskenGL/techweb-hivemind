import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';
import { Prisma } from '@prisma/client';
import { UserMetricDto } from '@users/dto';

@Injectable()
export class UserMetricMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createTestMetadata();
  }

  createTestMetadata(): void {
    PojosMetadataMap.create<Prisma.UserCountOutputType>('UserMetric', {
      followers: Number,
      followings: Number,
      buzzes: Number
    });
    PojosMetadataMap.create<UserMetricDto>('UserMetricDto', {
      followers: Number,
      followings: Number,
      buzzes: Number
    });
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<Prisma.UserCountOutputType, UserMetricDto>(
        mapper,
        'UserMetric',
        'UserMetricDto'
      );
    };
  }
}
