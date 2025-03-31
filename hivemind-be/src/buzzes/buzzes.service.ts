import { HttpStatus, Injectable } from '@nestjs/common';
import { Buzz, BuzzEngagement, Prisma } from '@prisma/client';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ApiLocalizedException } from '@common/exceptions';
import { MediaService } from '@media/media.service';
import { PrismaService } from '@datastore/prisma/prisma.service';
import { CursorPaginationQueryDto } from '@pagination/dto';
import { IPaginatedResult } from '@pagination/interfaces';
import {
  MainstreamCursorStrategy,
  UnpopularCursorStrategy,
  ControverseCursorStrategy,
  LatestIdCursorStrategy
} from '@pagination/strategies';
import { cursorPaginator } from '@pagination/cursor-paginator.helper';
import { UsersService } from '@users/users.service';
import {
  CreateBuzzDto,
  CreateVoteDto,
  UpdateBuzzDto,
  BuzzesSearchCriterionQueryDto
} from './dto';
import {
  additionalBuzzArgs,
  HydratedBuzz,
  buzzArgs,
  DryBuzz,
  AdditionalBuzzData,
  Bookmark,
  bookmarkArgs
} from './types';
import { BuzzesSearchCriterion } from './enums';

@Injectable()
export class BuzzesService {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly prismaService: PrismaService,
    private readonly mediaService: MediaService,
    private readonly usersService: UsersService
  ) {}

  async findBuzzById(buzzId: string): Promise<Buzz> {
    try {
      return await this.prismaService.buzz.findUniqueOrThrow({
        where: { id: buzzId }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ApiLocalizedException(
          HttpStatus.NOT_FOUND,
          'buzzes.not-found',
          { args: { buzzId } }
        );
      }
      throw error;
    }
  }

  async getBuzzById(
    buzzId: string,
    authenticatedUserId: string
  ): Promise<HydratedBuzz> {
    try {
      const buzz = await this.prismaService.buzz.findUniqueOrThrow({
        where: { id: buzzId },
        ...buzzArgs(authenticatedUserId)
      });
      return this.hydrateBuzz(authenticatedUserId, buzz);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ApiLocalizedException(
          HttpStatus.NOT_FOUND,
          'buzzes.not-found',
          { args: { buzzId } }
        );
      }
      throw error;
    }
  }

  async getUserBuzzes(
    userId: string,
    authenticatedUserId: string,
    cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<HydratedBuzz>> {
    const user = await this.usersService.findUserById(userId);
    const { data, pagination } = await cursorPaginator(
      cursorPaginationQueryDto
    )<DryBuzz, Prisma.BuzzFindManyArgs>(
      this.prismaService.buzz,
      LatestIdCursorStrategy,
      { where: { authorId: user.id }, ...buzzArgs(authenticatedUserId) }
    );
    return {
      data: await this.hydrateBuzz(authenticatedUserId, data),
      pagination
    };
  }

  async getBookmarkedBuzzes(
    authenticatedUserId: string,
    cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<HydratedBuzz>> {
    const { data, pagination } = await cursorPaginator(
      cursorPaginationQueryDto
    )<Bookmark, Prisma.BookmarkFindManyArgs>(
      this.prismaService.bookmark,
      LatestIdCursorStrategy,
      {
        where: { userId: authenticatedUserId },
        ...bookmarkArgs(authenticatedUserId)
      }
    );
    return {
      data: await this.hydrateBuzz(
        authenticatedUserId,
        data.map((bookmark) => bookmark.buzz)
      ),
      pagination
    };
  }

  async getBuzzesByCriterion(
    authenticatedUserId: string,
    buzzesSearchCriterionQueryDto: BuzzesSearchCriterionQueryDto,
    cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<HydratedBuzz>> {
    const criterion = buzzesSearchCriterionQueryDto.criterion;
    switch (criterion) {
      case BuzzesSearchCriterion.FOLLOWINGS:
        return this.getFollowingsBuzzes(
          authenticatedUserId,
          cursorPaginationQueryDto
        );
      case BuzzesSearchCriterion.HASHTAGS:
        if (!buzzesSearchCriterionQueryDto.values?.length) {
          throw new ApiLocalizedException(
            HttpStatus.BAD_REQUEST,
            'buzzes.criterion-parameters',
            { args: { criterion: BuzzesSearchCriterion.HASHTAGS } }
          );
        }
        return this.getBuzzesByHashtags(
          authenticatedUserId,
          buzzesSearchCriterionQueryDto.values,
          cursorPaginationQueryDto
        );
      case BuzzesSearchCriterion.MAINSTREAM:
      case BuzzesSearchCriterion.UNPOPULAR:
      case BuzzesSearchCriterion.CONTROVERSE:
        return this.getBuzzesByTrend(
          authenticatedUserId,
          criterion,
          cursorPaginationQueryDto
        );
    }
  }

  private async getBuzzesByTrend(
    authenticatedUserId: string,
    trend: BuzzesSearchCriterion,
    cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<HydratedBuzz>> {
    const trendStrategies = {
      [BuzzesSearchCriterion.MAINSTREAM]: {
        cursorStrategy: MainstreamCursorStrategy,
        filter: { voteBalance: { gte: 0 }, controversy: { lte: 0.8 } }
      },
      [BuzzesSearchCriterion.UNPOPULAR]: {
        cursorStrategy: UnpopularCursorStrategy,
        filter: { voteBalance: { lte: 0 }, controversy: { lte: 0.8 } }
      },
      [BuzzesSearchCriterion.CONTROVERSE]: {
        cursorStrategy: ControverseCursorStrategy,
        filter: { controversy: { gte: 0.8 } }
      }
    };
    const { cursorStrategy, filter } = trendStrategies[trend];
    const { data, pagination } = await cursorPaginator(
      cursorPaginationQueryDto
    )<BuzzEngagement, Prisma.BuzzEngagementFindManyArgs>(
      this.prismaService.buzzEngagement,
      cursorStrategy,
      { where: filter }
    );
    const buzzIds = data.map(({ id }) => id);
    const buzzesList = await this.prismaService.buzz.findMany({
      where: { id: { in: buzzIds } },
      ...buzzArgs(authenticatedUserId)
    });
    const buzzMap = new Map(buzzesList.map((buzz) => [buzz.id, buzz]));
    const buzzes = buzzIds.map((id) => buzzMap.get(id)!);
    return {
      data: await this.hydrateBuzz(authenticatedUserId, buzzes),
      pagination
    };
  }

  private async getBuzzesByHashtags(
    authenticatedUserId: string,
    hashtags: string[],
    cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<HydratedBuzz>> {
    hashtags = hashtags.map((hashtag) =>
      hashtag.startsWith('#') ? hashtag : `#${hashtag}`
    );
    const { data, pagination } = await cursorPaginator(
      cursorPaginationQueryDto
    )<DryBuzz, Prisma.BuzzFindManyArgs>(
      this.prismaService.buzz,
      LatestIdCursorStrategy,
      {
        where: { hashtags: { some: { name: { in: hashtags } } } },
        ...buzzArgs(authenticatedUserId)
      }
    );
    return {
      data: await this.hydrateBuzz(authenticatedUserId, data),
      pagination
    };
  }

  private async getFollowingsBuzzes(
    authenticatedUserId: string,
    cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<HydratedBuzz>> {
    const { data, pagination } = await cursorPaginator(
      cursorPaginationQueryDto
    )<DryBuzz, Prisma.BuzzFindManyArgs>(
      this.prismaService.buzz,
      LatestIdCursorStrategy,
      {
        where: {
          author: { followers: { some: { followerId: authenticatedUserId } } }
        },
        ...buzzArgs(authenticatedUserId)
      }
    );
    return {
      data: await this.hydrateBuzz(authenticatedUserId, data),
      pagination
    };
  }

  async createBuzz(createBuzzDto: CreateBuzzDto): Promise<string> {
    await this.mediaService.validateAttachments(
      createBuzzDto.media ?? [],
      createBuzzDto.authorId
    );
    let retries = 3;
    while (retries > 0) {
      try {
        const buzz = await this.prismaService.buzz.create({
          data: this.mapper.map<CreateBuzzDto, Prisma.BuzzUncheckedCreateInput>(
            createBuzzDto,
            'CreateBuzzDto',
            'PrismaCreateBuzz'
          )
        });
        return buzz.id;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          retries--;
        } else {
          throw error;
        }
      }
    }
    throw new ApiLocalizedException(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'general.internal'
    );
  }

  async deleteBuzz(buzzId: string, authenticatedUserId: string): Promise<void> {
    const buzz = await this.findBuzzById(buzzId);
    if (buzz.authorId !== authenticatedUserId) {
      throw new ApiLocalizedException(
        HttpStatus.UNAUTHORIZED,
        'auth.unauthorized'
      );
    }
    await this.prismaService.buzz.delete({ where: { id: buzzId } });
  }

  async updateBuzz(
    updateBuzzDto: UpdateBuzzDto,
    authenticatedUserId: string
  ): Promise<void> {
    const buzz = await this.findBuzzById(updateBuzzDto.id);
    if (buzz.authorId !== authenticatedUserId) {
      throw new ApiLocalizedException(
        HttpStatus.UNAUTHORIZED,
        'auth.unauthorized'
      );
    }
    await this.mediaService.validateAttachments(
      updateBuzzDto.media ?? [],
      authenticatedUserId
    );
    await this.prismaService.buzz.update({
      where: { id: updateBuzzDto.id },
      data: this.mapper.map<UpdateBuzzDto, Prisma.BuzzUpdateInput>(
        updateBuzzDto,
        'UpdateBuzzDto',
        'PrismaUpdateBuzz'
      )
    });
  }

  async view(buzzId: string): Promise<void> {
    try {
      await this.prismaService.buzz.update({
        where: { id: buzzId },
        data: { viewCount: { increment: 1 } }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ApiLocalizedException(
          HttpStatus.NOT_FOUND,
          'buzzes.not-found',
          { args: { buzzId } }
        );
      }
      throw error;
    }
  }

  async vote(createVoteDto: CreateVoteDto): Promise<void> {
    const buzz = await this.findBuzzById(createVoteDto.buzzId);
    if (buzz.authorId === createVoteDto.voterId) {
      throw new ApiLocalizedException(
        HttpStatus.BAD_REQUEST,
        'buzzes.self-vote'
      );
    }
    await this.prismaService.buzzVote.upsert({
      where: {
        voterId_buzzId: {
          voterId: createVoteDto.voterId,
          buzzId: createVoteDto.buzzId
        }
      },
      update: { type: createVoteDto.type },
      create: createVoteDto
    });
  }

  async unvote(buzzId: string, authenticatedUserId: string): Promise<void> {
    try {
      await this.findBuzzById(buzzId);
      await this.prismaService.buzzVote.delete({
        where: {
          voterId_buzzId: {
            voterId: authenticatedUserId,
            buzzId: buzzId
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
          'buzzes.not-voted',
          { args: [{ buzzId }] }
        );
      }
      throw error;
    }
  }

  async bookmark(buzzId: string, authenticatedUserId: string): Promise<void> {
    try {
      await this.findBuzzById(buzzId);
      await this.prismaService.bookmark.create({
        data: { buzzId, userId: authenticatedUserId }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ApiLocalizedException(
          HttpStatus.NOT_FOUND,
          'buzzes.not-found',
          { args: { buzzId } }
        );
      }
      throw error;
    }
  }

  async unbookmark(buzzId: string, authenticatedUserId: string): Promise<void> {
    try {
      await this.findBuzzById(buzzId);
      await this.prismaService.bookmark.delete({
        where: {
          userId_buzzId: {
            userId: authenticatedUserId,
            buzzId: buzzId
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
          'buzzes.not-bookmarked',
          { args: [{ buzzId }] }
        );
      }
      throw error;
    }
  }

  private async hydrateBuzz<T extends DryBuzz | DryBuzz[]>(
    authenticatedUserId: string,
    data: T
  ): Promise<T extends DryBuzz ? HydratedBuzz : HydratedBuzz[]> {
    if (Array.isArray(data)) {
      const ids = data.map(({ id }) => id);
      const additionalDataMap = new Map(
        (
          await this.prismaService.buzz.findMany({
            where: { id: { in: ids } },
            ...additionalBuzzArgs(authenticatedUserId)
          })
        ).map((item) => [item.id, item])
      );
      return data.map((buzz) =>
        this._hydrateBuzz(
          buzz,
          additionalDataMap.get(buzz.id)!,
          authenticatedUserId
        )
      ) as any;
    }
    const additionalData = await this.prismaService.buzz.findUniqueOrThrow({
      where: { id: data.id },
      ...additionalBuzzArgs(authenticatedUserId)
    });
    return this._hydrateBuzz(data, additionalData, authenticatedUserId) as any;
  }

  private _hydrateBuzz(
    buzz: DryBuzz,
    additionalData: AdditionalBuzzData,
    authenticatedUserId: string
  ): HydratedBuzz {
    return {
      ...buzz,
      author:
        buzz.author.id !== authenticatedUserId
          ? {
              ...buzz.author,
              relation: { followed: buzz.author.followers.length > 0 }
            }
          : buzz.author,
      _count: {
        ...buzz._count,
        upVotes: additionalData._count.votes
      },
      interaction: {
        vote: additionalData.votes.at(0)?.type ?? null,
        authored: authenticatedUserId === buzz.authorId,
        comments: additionalData._count.comments,
        bookmarked: additionalData._count.bookmarks > 0
      }
    };
  }
}
