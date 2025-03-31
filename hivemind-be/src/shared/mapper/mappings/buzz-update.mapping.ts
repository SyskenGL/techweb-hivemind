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
import { Prisma } from '@prisma/client';
import { markdown } from '@markdown/markdown.helper';
import { AttachMediaDto } from '@media/dto';
import { MediaType } from '@media/enums';
import { UpdateBuzzDto } from '@buzzes/dto';

@Injectable()
export class BuzzUpdateMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createTestMetadata();
  }

  createTestMetadata() {
    PojosMetadataMap.create<UpdateBuzzDto>('UpdateBuzzDto', {
      title: String,
      content: String,
      media: Array<AttachMediaDto>
    });
    PojosMetadataMap.create<Prisma.BuzzUpdateInput>('PrismaUpdateBuzz', {
      title: String,
      content: String,
      media: Array<object>,
      hashtags: Array<object>,
      updatedAt: String
    });
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<UpdateBuzzDto, Prisma.BuzzUpdateInput>(
        mapper,
        'UpdateBuzzDto',
        'PrismaUpdateBuzz',
        forMember(
          (destination) => destination.content,
          mapFrom((source) => markdown.renderInline(source.content))
        ),
        forMember(
          (destination) => destination.media,
          mapFrom(this.mapMediaAttachments)
        ),
        forMember(
          (destination) => destination.hashtags,
          mapFrom(this.mapHashtags)
        ),
        forMember(
          (destination) => destination.updatedAt,
          mapFrom(() => new Date().toISOString())
        )
      );
    };
  }

  private mapMediaAttachments(
    source: UpdateBuzzDto
  ): Prisma.BuzzMediaUpdateManyWithoutBuzzNestedInput {
    return source.media
      ? {
          deleteMany: { buzzId: source.id },
          create: (source.media ?? []).map((media, index) => {
            switch (media.type) {
              case MediaType.IMAGE:
                return { imageId: media.id, order: index };
              default:
                throw new Error(`Invalid media type ${media.type}`);
            }
          })
        }
      : {};
  }

  private mapHashtags(
    source: UpdateBuzzDto
  ): Prisma.HashtagUpdateManyWithoutBuzzesNestedInput {
    const env: { hashtags?: string[] } = {};
    markdown.renderInline(source.content, env);
    return {
      set: [],
      connectOrCreate: Array.from(new Set(env.hashtags ?? [])).map(
        (hashtag) => ({
          where: { name: hashtag },
          create: { name: hashtag }
        })
      )
    };
  }
}
