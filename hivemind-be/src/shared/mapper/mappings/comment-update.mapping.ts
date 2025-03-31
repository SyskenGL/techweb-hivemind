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
import { UpdateCommentDto } from '@comments/dto';

@Injectable()
export class CommentUpdateMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createTestMetadata();
  }

  createTestMetadata(): void {
    PojosMetadataMap.create<UpdateCommentDto>('UpdateCommentDto', {
      content: String
    });
    PojosMetadataMap.create<Prisma.CommentUpdateInput>('PrismaUpdateComment', {
      content: String,
      updatedAt: String
    });
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<UpdateCommentDto, Prisma.CommentUpdateInput>(
        mapper,
        'UpdateCommentDto',
        'PrismaUpdateComment',
        forMember(
          (destination) => destination.updatedAt,
          mapFrom(() => new Date().toISOString())
        )
      );
    };
  }
}
