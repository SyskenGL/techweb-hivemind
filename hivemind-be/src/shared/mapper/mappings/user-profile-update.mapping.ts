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
import { Prisma } from '@prisma/client';
import { UpdateProfileDto } from '@users/dto';

@Injectable()
export class UserProfileUpdateMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createTestMetadata();
  }

  createTestMetadata(): void {
    PojosMetadataMap.create<UpdateProfileDto>('UpdateProfileDto', {
      fullName: String,
      birthdate: String,
      bio: String,
      propicId: String,
      coverId: String,
      websiteUrl: Number,
      twitterUrl: Number,
      linkedInUrl: Number,
      facebookUrl: Number,
      instagramUrl: Number
    });
    PojosMetadataMap.create<Prisma.ProfileUncheckedCreateInput>(
      'PrismaUpdateProfile',
      {
        fullName: String,
        birthdate: String,
        bio: String,
        propicId: String,
        coverId: String,
        websiteUrl: Number,
        twitterUrl: Number,
        linkedInUrl: Number,
        facebookUrl: Number,
        instagramUrl: Number,
        updatedAt: String
      }
    );
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<UpdateProfileDto, Prisma.ProfileUncheckedCreateInput>(
        mapper,
        'UpdateProfileDto',
        'PrismaUpdateProfile',
        forMember(
          (destination) => destination.updatedAt,
          mapFrom(() => new Date().toISOString())
        )
      );
    };
  }
}
