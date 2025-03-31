import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';
import { Profile } from '@prisma/client';
import { ProfileDto } from '@users/dto';

@Injectable()
export class UserProfileMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createTestMetadata();
  }

  createTestMetadata(): void {
    PojosMetadataMap.create<Profile>('Profile', {
      id: String,
      fullName: String,
      birthdate: Date,
      bio: String,
      propicId: String,
      coverId: String,
      websiteUrl: String,
      twitterUrl: String,
      linkedInUrl: String,
      facebookUrl: String,
      instagramUrl: String,
      updatedAt: Date
    });
    PojosMetadataMap.create<ProfileDto>('ProfileDto', {
      fullName: String,
      birthdate: Date,
      bio: String,
      propicId: String,
      coverId: String,
      websiteUrl: String,
      twitterUrl: String,
      linkedInUrl: String,
      facebookUrl: String,
      instagramUrl: String,
      updatedAt: Date
    });
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<Profile, ProfileDto>(mapper, 'Profile', 'ProfileDto');
    };
  }
}
