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
import { CreateUserDto } from '@users/dto';

@Injectable()
export class UserCreateMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createTestMetadata();
  }

  createTestMetadata(): void {
    PojosMetadataMap.create<CreateUserDto>('CreateUserDto', {
      username: String,
      email: String,
      secret: String,
      fullName: String,
      birthdate: Date
    });
    PojosMetadataMap.create<Prisma.UserCreateInput>('PrismaCreateUser', {
      username: String,
      email: String,
      secret: String,
      profile: Object,
      verified: Boolean
    });
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<CreateUserDto, Prisma.UserCreateInput>(
        mapper,
        'CreateUserDto',
        'PrismaCreateUser',
        forMember(
          (destination) => destination.profile,
          mapFrom(this.mapProfile)
        ),
        forMember(
          (destination) => destination.verified,
          mapFrom(() => Math.random() < 0.6)
        )
      );
    };
  }

  private mapProfile(
    source: CreateUserDto
  ): Prisma.ProfileCreateNestedOneWithoutUserInput {
    return {
      create: {
        fullName: source.fullName,
        birthdate: source.birthdate
      }
    };
  }
}
