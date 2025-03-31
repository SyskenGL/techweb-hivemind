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
import { PartialUser } from '@users/types';
import { UserPreviewDto } from '@users/dto';

@Injectable()
export class UserPreviewMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createTestMetadata();
  }

  createTestMetadata(): void {
    PojosMetadataMap.create<PartialUser>('PartialUser', {
      id: String,
      username: String,
      profile: Object,
      verified: Boolean,
      relation: Object
    });
    PojosMetadataMap.create<UserPreviewDto>('UserPreviewDto', {
      id: String,
      username: String,
      fullName: String,
      propicId: String,
      verified: Boolean,
      relation: Object
    });
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<PartialUser, UserPreviewDto>(
        mapper,
        'PartialUser',
        'UserPreviewDto',
        forMember(
          (destination) => destination.fullName,
          mapFrom((source) => source.profile!.fullName)
        ),
        forMember(
          (destination) => destination.propicId,
          mapFrom((source) => source.profile!.propicId)
        )
      );
    };
  }
}
