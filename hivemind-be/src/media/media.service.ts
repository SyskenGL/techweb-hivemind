import { HttpStatus, Inject, Injectable, StreamableFile } from '@nestjs/common';
import { MINIO_CONNECTION } from 'nestjs-minio';
import { PrismaService } from '@datastore/prisma/prisma.service';
import { ApiLocalizedException } from '@common/exceptions';
import { Image, Prisma } from '@prisma/client';
import { Client } from 'minio';
import * as sharp from 'sharp';
import { v4 } from 'uuid';
import { PassThrough, Readable } from 'stream';
import { Fit, MediaType } from './enums';
import { AttachMediaDto, ImageResizeQueryDto } from './dto';

@Injectable()
export class MediaService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(MINIO_CONNECTION) private readonly minioService: Client
  ) {}

  async findMediaById(mediaId: string, type: MediaType): Promise<Image> {
    switch (type) {
      case MediaType.IMAGE:
        return this.findImageById(mediaId);
      default:
        throw new ApiLocalizedException(
          HttpStatus.BAD_REQUEST,
          'media.invalid-media-type',
          { args: [{ type }] }
        );
    }
  }

  async findImageById(imageId: string): Promise<Image> {
    try {
      return await this.prismaService.image.findUniqueOrThrow({
        where: { id: imageId }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ApiLocalizedException(
          HttpStatus.NOT_FOUND,
          'media.not-found',
          { args: [{ type: 'image' }, { mediaId: imageId }] }
        );
      }
      throw error;
    }
  }

  async uploadImage(
    authenticatedUserId: string,
    file: Express.Multer.File
  ): Promise<string> {
    const metadata = await sharp(file.buffer).metadata();
    const { width, height, size, format } = metadata;
    if (!width || !height || !size || !format) {
      throw new ApiLocalizedException(
        HttpStatus.BAD_REQUEST,
        'media.invalid-metadata'
      );
    }
    const filename = `${v4()}.${format}`;
    await this.minioService.putObject(
      'hivemind-users-media',
      `${authenticatedUserId}/images/${filename}`,
      file.buffer
    );
    const image = await this.prismaService.image.create({
      data: {
        ownerId: authenticatedUserId,
        filename,
        format,
        size,
        width,
        height
      }
    });
    return image.id;
  }

  async downloadImage(
    imageId: string,
    imageResizeQueryDto: ImageResizeQueryDto
  ): Promise<StreamableFile> {
    const image = await this.findImageById(imageId);
    const stream = await this.minioService.getObject(
      'hivemind-users-media',
      `${image.ownerId}/images/${image.filename}`
    );
    if (['webp', 'gif'].includes(image.format)) {
      return new StreamableFile(stream, { type: `image/${image.format}` });
    }
    const { width, height } = imageResizeQueryDto;
    if (width || height) {
      if (imageResizeQueryDto.fit === Fit.LETTERBOX && width !== height) {
        return new StreamableFile(
          await this.applyLetterBoxPipeline(stream, { width, height }),
          { type: `image/${image.format}` }
        );
      } else if (imageResizeQueryDto.fit !== Fit.LETTERBOX) {
        return new StreamableFile(
          this.applyResizePipeline(stream, {
            width,
            height,
            fit: imageResizeQueryDto.fit as keyof sharp.FitEnum
          }),
          { type: `image/${image.format}` }
        );
      }
    }
    return new StreamableFile(stream, {
      type: `image/${image.format}`
    });
  }

  async validateAttachments(
    attachments: AttachMediaDto[],
    authenticatedUserId: string
  ): Promise<void> {
    for (const attachment of attachments) {
      const media = await this.findMediaById(attachment.id, attachment.type);
      if (media.ownerId !== authenticatedUserId) {
        throw new ApiLocalizedException(
          HttpStatus.UNAUTHORIZED,
          'auth.unauthorized'
        );
      }
    }
  }

  private applyResizePipeline(
    stream: Readable,
    resizeOptions?: sharp.ResizeOptions
  ): sharp.Sharp {
    const resizePipeline = sharp().resize(resizeOptions);
    return stream.pipe(resizePipeline);
  }

  private async applyLetterBoxPipeline(
    stream: Readable,
    resizeOptions?: sharp.ResizeOptions
  ): Promise<Readable> {
    const resizedStream = new PassThrough();
    const letterBoxStream = new PassThrough();
    stream.pipe(resizedStream);
    stream.pipe(letterBoxStream);
    const resizedStreamTransformed = this.applyResizePipeline(resizedStream, {
      width: resizeOptions?.width,
      height: resizeOptions?.height,
      fit: sharp.fit.inside
    });
    const resizedBuffer = await resizedStreamTransformed.toBuffer();
    const letterBoxPipeline = sharp()
      .modulate({ brightness: 0.7 })
      .blur(50)
      .resize({
        ...resizeOptions,
        fit: sharp.fit.cover
      })
      .composite([{ input: resizedBuffer, gravity: 'center' }]);
    return letterBoxStream.pipe(letterBoxPipeline);
  }
}
