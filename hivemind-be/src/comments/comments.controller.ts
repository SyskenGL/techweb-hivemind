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
import { IPaginatedResult } from '@pagination/interfaces';
import { CursorPaginationQueryDto } from '@pagination/dto';
import { ApiPaginatedCursor } from '@pagination/decorators';
import { buildHandlerPath } from '@common/utils';
import { GetSub } from '@auth/decorators';
import { Request, Response } from 'express';
import {
  CommentDto,
  CreateCommentDto,
  CreateVoteDto,
  UpdateCommentDto
} from './dto';
import { HydratedComment } from './types';
import { CommentsService } from './comments.service';

@Controller()
@ApiTags('Comments')
@ApiBearerAuth()
export class CommentsController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly commentsService: CommentsService
  ) {}

  @Get('comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieves the details of a comment given its ID.'
  })
  @ApiOkResponse({ type: CommentDto })
  async getCommentById(
    @Param('commentId') commentId: string,
    @GetSub() authenticatedUserId: string
  ): Promise<CommentDto> {
    return this.mapper.map<HydratedComment, CommentDto>(
      await this.commentsService.getCommentById(commentId, authenticatedUserId),
      'Comment',
      'CommentDto'
    );
  }

  @Get('comments/:commentId/replies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieves the replies of a comment given its ID.' })
  @ApiPaginatedCursor({ model: CommentDto })
  async getCommentReplies(
    @Param('commentId') commentId: string,
    @GetSub() authenticatedUserId: string,
    @Query() cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<CommentDto>> {
    const { data, pagination } = await this.commentsService.getCommentReplies(
      commentId,
      authenticatedUserId,
      cursorPaginationQueryDto
    );
    return {
      data: data.map((comment) =>
        this.mapper.map(comment, 'Comment', 'CommentDto')
      ),
      pagination
    };
  }

  @Get('buzzes/:buzzId/comments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieves the comments of a buzz given its ID.' })
  @ApiPaginatedCursor({ model: CommentDto })
  async getCommentsByBuzzId(
    @Param('buzzId') buzzId: string,
    @GetSub() authenticatedUserId: string,
    @Query() cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<CommentDto>> {
    const { data, pagination } = await this.commentsService.getCommentsByBuzzId(
      buzzId,
      authenticatedUserId,
      cursorPaginationQueryDto
    );
    return {
      data: data.map((comment) =>
        this.mapper.map(comment, 'Comment', 'CommentDto')
      ),
      pagination
    };
  }

  @Post('buzzes/:buzzId/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Creates a comment for a buzz given its ID.'
  })
  @ApiBody({ type: CreateCommentDto })
  async createBuzz(
    @Param('buzzId') buzzId: string,
    @Body() createCommentDto: CreateCommentDto,
    @GetSub() authenticatedUserId: string,
    @Req() request: Request,
    @Res() response: Response
  ): Promise<void> {
    const commentId = await this.commentsService.createComment({
      ...createCommentDto,
      buzzId,
      authorId: authenticatedUserId
    });
    response.location(
      buildHandlerPath(
        request.url.match(/^(.*?\/v[0-9]+)/)?.[0] || '',
        CommentsController,
        CommentsController.prototype.getCommentById,
        { commentId: commentId.toString() }
      )
    );
    response.status(HttpStatus.CREATED).end();
  }

  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletes a comment given its ID.'
  })
  async deleteComment(
    @Param('commentId') commentId: string,
    @GetSub() authenticatedUserId: string
  ): Promise<void> {
    await this.commentsService.deleteComment(commentId, authenticatedUserId);
  }

  @Patch('comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Updates a comment with the provided details given its ID.'
  })
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @GetSub() authenticatedUserId: string
  ): Promise<void> {
    await this.commentsService.updateComment(
      { ...updateCommentDto, id: commentId },
      authenticatedUserId
    );
  }

  @Post('comments/:commentId/votes')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Registers a vote on a comment given its ID.'
  })
  @ApiBody({ type: CreateVoteDto })
  async vote(
    @Param('commentId') commentId: string,
    @GetSub() authenticatedUserId: string,
    @Body() createVoteDto: CreateVoteDto
  ): Promise<void> {
    await this.commentsService.vote({
      ...createVoteDto,
      voterId: authenticatedUserId,
      commentId: commentId
    });
  }

  @Delete('comments/:commentId/votes')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletes the vote provided on a comment given ID.'
  })
  async unvote(
    @Param('commentId') commentId: string,
    @GetSub() authenticatedUserId: string
  ): Promise<void> {
    await this.commentsService.unvote(commentId, authenticatedUserId);
  }
}
