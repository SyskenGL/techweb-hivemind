import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Response, Request } from 'express';
import { GetSub } from '@auth/decorators';
import { buildHandlerPath } from '@common/utils';
import { ApiPaginatedCursor } from '@pagination/decorators';
import { IPaginatedResult } from '@pagination/interfaces';
import { CursorPaginationQueryDto } from '@pagination/dto';
import { BuzzesService } from './buzzes.service';
import { HydratedBuzz } from './types';
import {
  CreateBuzzDto,
  CreateVoteDto,
  UpdateBuzzDto,
  BuzzDto,
  BuzzesSearchCriterionQueryDto
} from './dto';
import { BuzzesSearchCriterion } from './enums';

@Controller()
@ApiTags('Buzzes')
@ApiBearerAuth()
export class BuzzesController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly buzzesService: BuzzesService
  ) {}

  @Get('buzzes/:buzzId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieves the details of a buzz given its ID.'
  })
  @ApiOkResponse({ type: BuzzDto })
  async getBuzzById(
    @Param('buzzId') buzzId: string,
    @GetSub() authenticatedUserId: string
  ): Promise<BuzzDto> {
    return this.mapper.map<HydratedBuzz, BuzzDto>(
      await this.buzzesService.getBuzzById(buzzId, authenticatedUserId),
      'Buzz',
      'BuzzDto'
    );
  }

  @Get('users/:userId/buzzes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Retrieves the buzzes of an user given either their id or username.'
  })
  @ApiPaginatedCursor({ model: BuzzDto })
  async getUserBuzzes(
    @Param('userId') userId: string,
    @GetSub() authenticatedUserId: string,
    @Query() cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<BuzzDto>> {
    const { data, pagination } = await this.buzzesService.getUserBuzzes(
      userId,
      authenticatedUserId,
      cursorPaginationQueryDto
    );
    return {
      data: data.map((buzz) => this.mapper.map(buzz, 'Buzz', 'BuzzDto')),
      pagination
    };
  }

  @Get('bookmarks/buzzes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieves the buzzes bookmarked by the current user.'
  })
  @ApiPaginatedCursor({ model: BuzzDto })
  async getBookmarkedBuzzes(
    @GetSub() authenticatedUserId: string,
    @Query() cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<BuzzDto>> {
    const { data, pagination } = await this.buzzesService.getBookmarkedBuzzes(
      authenticatedUserId,
      cursorPaginationQueryDto
    );
    return {
      data: data.map((buzz) => this.mapper.map(buzz, 'Buzz', 'BuzzDto')),
      pagination
    };
  }

  @Get('buzzes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieves buzzes based on the provided search criterion.',
    description:
      'Pagination for the following criterion may be unstable due to frequent changes in content:' +
      [
        BuzzesSearchCriterion.CONTROVERSE,
        BuzzesSearchCriterion.MAINSTREAM,
        BuzzesSearchCriterion.UNPOPULAR
      ]
  })
  @ApiPaginatedCursor({ model: BuzzDto })
  async getBuzzesByCriterion(
    @GetSub() authenticatedUserId: string,
    @Query() buzzesSearchCriterionQueryDto: BuzzesSearchCriterionQueryDto,
    @Query() cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<BuzzDto>> {
    const { data, pagination } = await this.buzzesService.getBuzzesByCriterion(
      authenticatedUserId,
      buzzesSearchCriterionQueryDto,
      cursorPaginationQueryDto
    );
    return {
      data: data.map((buzz) => this.mapper.map(buzz, 'Buzz', 'BuzzDto')),
      pagination
    };
  }

  @Post('buzzes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Creates a new buzz.'
  })
  @ApiBody({ type: CreateBuzzDto })
  async createBuzz(
    @Body() createBuzzDto: CreateBuzzDto,
    @GetSub() authenticatedUserId: string,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void> {
    const buzzId = await this.buzzesService.createBuzz({
      ...createBuzzDto,
      authorId: authenticatedUserId
    });
    response.location(
      buildHandlerPath(
        request.url.match(/^(.*?\/v[0-9]+)/)?.[0] || '',
        BuzzesController,
        BuzzesController.prototype.getBuzzById,
        { buzzId: buzzId.toString() }
      )
    );
    response.status(HttpStatus.CREATED).end();
  }

  @Delete('buzzes/:buzzId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletes a buzz given its ID.'
  })
  async deleteBuzz(
    @Param('buzzId') buzzId: string,
    @GetSub() authenticatedUserId: string
  ): Promise<void> {
    await this.buzzesService.deleteBuzz(buzzId, authenticatedUserId);
  }

  @Patch('buzzes/:buzzId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Updates a buzz with the provided details given its ID.'
  })
  async updateBuzz(
    @Param('buzzId') buzzId: string,
    @Body() updateBuzzDto: UpdateBuzzDto,
    @GetSub() authenticatedUserId: string
  ): Promise<void> {
    await this.buzzesService.updateBuzz(
      { ...updateBuzzDto, id: buzzId },
      authenticatedUserId
    );
  }

  @Post('buzzes/:buzzId/views')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Registers a view on a buzz given its ID.'
  })
  async view(@Param('buzzId') buzzId: string): Promise<void> {
    await this.buzzesService.view(buzzId);
  }

  @Post('buzzes/:buzzId/votes')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Registers a vote on a buzz given its ID.'
  })
  @ApiBody({ type: CreateVoteDto })
  async vote(
    @Param('buzzId') buzzId: string,
    @GetSub() authenticatedUserId: string,
    @Body() createVoteDto: CreateVoteDto
  ): Promise<void> {
    await this.buzzesService.vote({
      ...createVoteDto,
      voterId: authenticatedUserId,
      buzzId: buzzId
    });
  }

  @Delete('buzzes/:buzzId/votes')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletes the vote provided on a buzz given its ID.'
  })
  async unvote(
    @Param('buzzId') buzzId: string,
    @GetSub() authenticatedUserId: string
  ): Promise<void> {
    await this.buzzesService.unvote(buzzId, authenticatedUserId);
  }

  @Post('bookmarks/buzzes/:buzzId/')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Creates a bookmark for the buzz specified by its ID.'
  })
  async bookmark(
    @Param('buzzId') buzzId: string,
    @GetSub() authenticatedUserId: string
  ): Promise<void> {
    await this.buzzesService.bookmark(buzzId, authenticatedUserId);
  }

  @Delete('bookmarks/buzzes/:buzzId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletes the bookmark from the buzz identified by its ID.'
  })
  async unbookmark(
    @Param('buzzId') buzzId: string,
    @GetSub() authenticatedUserId: string
  ): Promise<void> {
    await this.buzzesService.unbookmark(buzzId, authenticatedUserId);
  }
}
