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
import { MediaType } from '@media/enums';
import { CreateBuzzDto } from '@buzzes/dto';

@Injectable()
export class BuzzCreateMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createTestMetadata();
  }

  createTestMetadata(): void {
    PojosMetadataMap.create<CreateBuzzDto>('CreateBuzzDto', {
      title: String,
      content: String,
      media: Array<number>,
      authorId: String
    });
    PojosMetadataMap.create<Prisma.BuzzUncheckedCreateInput>(
      'PrismaCreateBuzz',
      {
        title: String,
        content: String,
        media: Array<object>,
        hashtags: Array<object>,
        authorId: String
      }
    );
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<CreateBuzzDto, Prisma.BuzzUncheckedCreateInput>(
        mapper,
        'CreateBuzzDto',
        'PrismaCreateBuzz',
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
        )
      );
    };
  }

  private mapMediaAttachments(
    source: CreateBuzzDto
  ): Prisma.BuzzMediaUncheckedCreateNestedManyWithoutBuzzInput {
    return {
      create: (source.media ?? []).map((media, index) => {
        switch (media.type) {
          case MediaType.IMAGE:
            return { imageId: media.id, order: index };
          default:
            throw new Error(`Invalid media type ${media.type}`);
        }
      })
    };
  }

  private mapHashtags(
    source: CreateBuzzDto
  ): Prisma.HashtagCreateNestedManyWithoutBuzzesInput {
    const env: { hashtags?: string[] } = {};
    markdown.renderInline(source.content, env);
    return {
      connectOrCreate: Array.from(new Set(env.hashtags ?? [])).map(
        (hashtag) => ({
          where: { name: hashtag },
          create: { name: hashtag }
        })
      )
    };
  }
}
