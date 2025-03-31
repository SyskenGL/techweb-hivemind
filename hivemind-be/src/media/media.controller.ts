import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { Response } from 'express';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { GetSub, Public } from '@auth/decorators';
import { buildHandlerPath } from '@common/utils';
import { ImageDto, ImageResizeQueryDto, UploadMediaDto } from './dto';
import { MediaService } from './media.service';

@Controller('media')
@ApiTags('Media')
export class MediaController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly mediaService: MediaService
  ) {}

  @Post('images')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('media'))
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Uploads an image file (GIF, PNG, JPEG, WEBP) with a maximum size limit of 15MB.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadMediaDto })
  async uploadImage(
    @GetSub() authenticatedUserId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /^image\/(gif|png|jpeg|jpg|webp)$/
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 15
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        })
    )
    media: Express.Multer.File,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void> {
    const imageId = await this.mediaService.uploadImage(
      authenticatedUserId,
      media
    );
    response.location(
      buildHandlerPath(
        request.url.match(/^(.*?\/v[0-9]+)/)?.[0] || '',
        MediaController,
        MediaController.prototype.downloadImage,
        { imageId: imageId.toString() }
      )
    );
    response.status(HttpStatus.CREATED).end();
  }

  @Get('images/:imageId')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Downloads an image, with optional resizing, given its ID.'
  })
  @ApiOkResponse({ type: StreamableFile })
  async downloadImage(
    @Param('imageId') imageId: string,
    @Query() imageResizeQueryDto: ImageResizeQueryDto
  ): Promise<StreamableFile> {
    return this.mediaService.downloadImage(imageId, imageResizeQueryDto);
  }

  @Get('images/:imageId/info')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Retrieves image additional info given its ID.'
  })
  @ApiOkResponse({ type: ImageDto })
  async getImageInfo(@Param('imageId') imageId: string): Promise<ImageDto> {
    return this.mapper.map(
      await this.mediaService.findImageById(imageId),
      'Image',
      'ImageDto'
    );
  }
}
