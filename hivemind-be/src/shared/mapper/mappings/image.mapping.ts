import { Injectable } from '@nestjs/common';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, Mapper, MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';
import { Image } from '@prisma/client';
import { ImageDto } from '@media/dto';

@Injectable()
export class ImageMapping extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
    this.createTestMetadata();
  }

  createTestMetadata(): void {
    PojosMetadataMap.create<Image>('Image', {
      id: String,
      ownerId: String,
      filename: String,
      format: String,
      size: Number,
      width: Number,
      height: Number,
      uploadedAt: Date
    });
    PojosMetadataMap.create<ImageDto>('ImageDto', {
      id: String,
      filename: String,
      format: String,
      size: Number,
      width: Number,
      height: Number,
      uploadedAt: Date
    });
  }

  get profile(): MappingProfile {
    return (mapper) => {
      createMap<Image, ImageDto>(mapper, 'Image', 'ImageDto');
    };
  }
}
