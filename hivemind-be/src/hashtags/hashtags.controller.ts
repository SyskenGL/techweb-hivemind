import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { HashtagsService } from './hashtags.service';
import { HashtagEngagement } from '@prisma/client';

@Controller('hashtags')
@ApiTags('Hashtags')
@ApiBearerAuth()
export class HashtagsController {
  constructor(private readonly hashtagsService: HashtagsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieves the top 10 trending hashtags from the past 24 hours.'
  })
  @ApiOkResponse({ type: Array<HashtagEngagement> })
  async getTrendingHashtags(): Promise<HashtagEngagement[]> {
    return await this.hashtagsService.getTrendingHashtags();
  }
}
