import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { PrismaService } from '@datastore/prisma/prisma.service';
import { IPaginatedResult } from '@pagination/interfaces';
import { CursorPaginationQueryDto } from '@pagination/dto';
import { cursorPaginator } from '@pagination/cursor-paginator.helper';
import {
  LatestIdCursorStrategy,
  OldestIdCursorStrategy
} from '@pagination/strategies';
import { ApiLocalizedException } from '@common/exceptions';
import { Comment, Prisma } from '@prisma/client';
import { BuzzesService } from '@buzzes/buzzes.service';
import {
  additionalCommentArgs,
  AdditionalCommentData,
  DryComment,
  HydratedComment,
  commentArgs
} from './types';
import { CreateCommentDto, CreateVoteDto, UpdateCommentDto } from './dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly prismaService: PrismaService,
    private readonly buzzesService: BuzzesService
  ) {}

  async findCommentById(commentId: string): Promise<Comment> {
    try {
      return await this.prismaService.comment.findUniqueOrThrow({
        where: { id: commentId }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ApiLocalizedException(
          HttpStatus.NOT_FOUND,
          'comments.not-found',
          { args: { commentId } }
        );
      }
      throw error;
    }
  }

  async getCommentById(
    commentId: string,
    authenticatedUserId: string
  ): Promise<HydratedComment> {
    try {
      const comment = await this.prismaService.comment.findUniqueOrThrow({
        where: { id: commentId },
        ...commentArgs(authenticatedUserId)
      });
      return this.hydrateComment(authenticatedUserId, comment);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ApiLocalizedException(
          HttpStatus.NOT_FOUND,
          'comments.not-found',
          { args: { commentId } }
        );
      }
      throw error;
    }
  }

  async getCommentReplies(
    commentId: string,
    authenticatedUserId: string,
    cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<HydratedComment>> {
    await this.findCommentById(commentId);
    const { data, pagination } = await cursorPaginator(
      cursorPaginationQueryDto
    )<HydratedComment, Prisma.CommentFindManyArgs>(
      this.prismaService.comment,
      OldestIdCursorStrategy,
      {
        where: { parentCommentId: commentId },
        ...commentArgs(authenticatedUserId)
      }
    );
    return {
      data: await this.hydrateComment(authenticatedUserId, data),
      pagination
    };
  }

  async getCommentsByBuzzId(
    buzzId: string,
    authenticatedUserId: string,
    cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<HydratedComment>> {
    await this.buzzesService.findBuzzById(buzzId);
    const { data, pagination } = await cursorPaginator(
      cursorPaginationQueryDto
    )<HydratedComment, Prisma.CommentFindManyArgs>(
      this.prismaService.comment,
      LatestIdCursorStrategy,
      {
        where: { buzzId: buzzId, parentCommentId: null },
        ...commentArgs(authenticatedUserId)
      }
    );
    return {
      data: await this.hydrateComment(authenticatedUserId, data),
      pagination
    };
  }

  async createComment(createCommentDto: CreateCommentDto): Promise<string> {
    const parentComment = createCommentDto.parentCommentId
      ? await this.findCommentById(createCommentDto.parentCommentId)
      : null;
    if (parentComment && parentComment.buzzId !== createCommentDto.buzzId) {
      throw new ApiLocalizedException(
        HttpStatus.BAD_REQUEST,
        'comments.not-same-buzz'
      );
    }
    if (parentComment?.parentCommentId) {
      throw new ApiLocalizedException(
        HttpStatus.BAD_REQUEST,
        'comments.reply-depth',
        { args: { parentCommentId: parentComment.parentCommentId } }
      );
    }
    try {
      const comment = await this.prismaService.comment.create({
        data: this.mapper.map<
          CreateCommentDto,
          Prisma.CommentUncheckedCreateInput
        >(createCommentDto, 'CreateCommentDto', 'PrismaCreateComment')
      });
      return comment.id;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ApiLocalizedException(
          HttpStatus.NOT_FOUND,
          'buzzes.not-found',
          { args: { buzzId: createCommentDto.buzzId } }
        );
      }
      throw error;
    }
  }

  async updateComment(
    updateCommentDto: UpdateCommentDto,
    authenticatedUserId: string
  ): Promise<void> {
    const comment = await this.findCommentById(updateCommentDto.id);
    if (comment.authorId !== authenticatedUserId) {
      throw new ApiLocalizedException(
        HttpStatus.UNAUTHORIZED,
        'auth.unauthorized'
      );
    }
    await this.prismaService.comment.update({
      where: { id: updateCommentDto.id },
      data: this.mapper.map<UpdateCommentDto, Prisma.CommentUpdateInput>(
        updateCommentDto,
        'UpdateCommentDto',
        'PrismaUpdateComment'
      )
    });
  }

  async deleteComment(
    commentId: string,
    authenticatedUserId: string
  ): Promise<void> {
    const comment = await this.findCommentById(commentId);
    if (comment.authorId !== authenticatedUserId) {
      throw new ApiLocalizedException(
        HttpStatus.UNAUTHORIZED,
        'auth.unauthorized'
      );
    }
    await this.prismaService.comment.delete({ where: { id: commentId } });
  }

  async vote(createVoteDto: CreateVoteDto): Promise<void> {
    try {
      const comment = await this.findCommentById(createVoteDto.commentId);
      if (comment.authorId === createVoteDto.voterId) {
        throw new ApiLocalizedException(
          HttpStatus.BAD_REQUEST,
          'comments.self-vote'
        );
      }
      await this.prismaService.commentVote.upsert({
        where: {
          voterId_commentId: {
            voterId: createVoteDto.voterId,
            commentId: createVoteDto.commentId
          }
        },
        update: { type: createVoteDto.type },
        create: createVoteDto
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new ApiLocalizedException(
            HttpStatus.NOT_FOUND,
            'comments.not-found',
            {
              args: { commentId: createVoteDto.commentId }
            }
          );
        }
      }
      throw error;
    }
  }

  async unvote(commentId: string, authenticatedUserId: string): Promise<void> {
    try {
      await this.findCommentById(commentId);
      await this.prismaService.commentVote.delete({
        where: {
          voterId_commentId: {
            voterId: authenticatedUserId,
            commentId: commentId
          }
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ApiLocalizedException(
          HttpStatus.NOT_FOUND,
          'comments.unvoted',
          { args: [{ commentId }] }
        );
      }
      throw error;
    }
  }

  private async hydrateComment<T extends DryComment | DryComment[]>(
    authenticatedUserId: string,
    data: T
  ): Promise<T extends DryComment ? HydratedComment : HydratedComment[]> {
    if (Array.isArray(data)) {
      const ids = data.map(({ id }) => id);
      const additionalDataMap = new Map(
        (
          await this.prismaService.comment.findMany({
            where: { id: { in: ids } },
            ...additionalCommentArgs(authenticatedUserId)
          })
        ).map((item) => [item.id, item])
      );
      return data.map((comment) =>
        this._hydrateComment(
          comment,
          additionalDataMap.get(comment.id)!,
          authenticatedUserId
        )
      ) as any;
    }
    const additionalData = await this.prismaService.comment.findUniqueOrThrow({
      where: { id: data.id },
      ...additionalCommentArgs(authenticatedUserId)
    });
    return this._hydrateComment(
      data,
      additionalData,
      authenticatedUserId
    ) as any;
  }

  private _hydrateComment(
    comment: DryComment,
    additionalData: AdditionalCommentData,
    authenticatedUserId: string
  ): HydratedComment {
    return {
      ...comment,
      author:
        comment.author.id !== authenticatedUserId
          ? {
              ...comment.author,
              relation: { followed: comment.author.followers.length > 0 }
            }
          : comment.author,
      _count: {
        ...comment._count,
        upVotes: additionalData._count.votes
      },
      interaction: {
        vote: additionalData.votes.at(0)?.type ?? null,
        authored: authenticatedUserId === comment.authorId,
        replied: additionalData._count.replies > 0
      }
    };
  }
}
