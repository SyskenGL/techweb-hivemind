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
import { HydratedUser } from '@users/types';
import { UserDto } from '@users/dto';

@Injectable()
export class UserMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createTestMetadata();
  }

  createTestMetadata(): void {
    PojosMetadataMap.create<HydratedUser>('User', {
      id: String,
      username: String,
      email: String,
      secret: String,
      verified: Boolean,
      createdAt: Date,
      profile: 'Profile',
      _count: 'UserMetric',
      relation: Object
    });
    PojosMetadataMap.create<UserDto>('UserDto', {
      id: String,
      username: String,
      email: String,
      verified: Boolean,
      createdAt: Date,
      profile: 'ProfileDto',
      metric: 'UserMetricDto',
      relation: Object
    });
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<HydratedUser, UserDto>(
        mapper,
        'User',
        'UserDto',
        forMember(
          (destination) => destination.metric,
          mapWith('UserMetricDto', 'UserMetric', (source) => source._count)
        )
      );
    };
  }
}
