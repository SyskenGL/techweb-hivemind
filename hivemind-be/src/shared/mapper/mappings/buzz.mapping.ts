import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import {
  createMap,
  forMember,
  MappingProfile,
  mapFrom,
  mapWith,
  Mapper
} from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';
import { BuzzMedia, HydratedBuzz } from '@buzzes/types';
import { Hashtag } from '@prisma/client';
import { BuzzDto, BuzzMetricDto } from '@buzzes/dto';
import { MediaDto } from '@media/dto';
import { MediaType } from '@media/enums';

@Injectable()
export class BuzzMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createTestMetadata();
  }

  createTestMetadata(): void {
    PojosMetadataMap.create<HydratedBuzz>('Buzz', {
      id: String,
      author: 'PartialUser',
      title: String,
      content: String,
      createdAt: Date,
      updatedAt: Date,
      viewCount: Number,
      hashtags: Array<Hashtag>,
      media: Array<BuzzMedia>,
      _count: 'BuzzMetric',
      interaction: Object
    });
    PojosMetadataMap.create<BuzzDto>('BuzzDto', {
      id: String,
      author: 'UserPreviewDto',
      title: String,
      content: String,
      createdAt: Date,
      updatedAt: Date,
      media: Array<MediaDto>,
      metric: 'BuzzMetricDto',
      interaction: Object
    });
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<HydratedBuzz, BuzzDto>(
        mapper,
        'Buzz',
        'BuzzDto',
        forMember(
          (destination) => destination.metric,
          mapFrom(this.mapMetric.bind(this))
        ),
        forMember(
          (destination) => destination.author,
          mapWith('UserPreviewDto', 'PartialUser', (source) => source.author)
        ),
        forMember((destination) => destination.media, mapFrom(this.mapMedia))
      );
    };
  }

  private mapMedia(source: HydratedBuzz): Array<MediaDto> {
    return source.media.map((buzzMedia) => {
      return { type: MediaType.IMAGE, id: buzzMedia.image.id };
    });
  }

  private mapMetric(source: HydratedBuzz): BuzzMetricDto {
    const metric = this.mapper.map(
      source._count,
      'BuzzMetric',
      'BuzzMetricDto'
    ) as BuzzMetricDto;
    return { ...metric, views: source.viewCount };
  }
}
