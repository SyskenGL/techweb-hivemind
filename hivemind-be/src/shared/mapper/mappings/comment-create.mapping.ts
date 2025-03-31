import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  forMember,
  mapFrom,
  Mapper,
  MappingProfile
} from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';
import { Prisma } from '@prisma/client';
import { CreateCommentDto } from '@comments/dto';
import { markdown } from '@markdown/markdown.helper';

@Injectable()
export class CommentCreateMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createTestMetadata();
  }

  createTestMetadata(): void {
    PojosMetadataMap.create<CreateCommentDto>('CreateCommentDto', {
      buzzId: String,
      authorId: String,
      parentCommentId: String,
      content: String
    });
    PojosMetadataMap.create<Prisma.CommentUncheckedCreateInput>(
      'PrismaCreateComment',
      {
        buzzId: String,
        authorId: String,
        parentCommentId: String,
        content: String
      }
    );
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<CreateCommentDto, Prisma.CommentUncheckedCreateInput>(
        mapper,
        'CreateCommentDto',
        'PrismaCreateComment',
        forMember(
          (destination) => destination.content,
          mapFrom((source) => markdown.renderInline(source.content))
        )
      );
    };
  }
}
