import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Prisma, User } from '@prisma/client';
import { isEmail } from 'class-validator';
import { PrismaService } from '@datastore/prisma/prisma.service';
import { MediaService } from '@media/media.service';
import { MediaType } from '@media/enums';
import { IPaginatedResult } from '@pagination/interfaces';
import { CursorPaginationQueryDto } from '@pagination/dto';
import { cursorPaginator } from '@pagination/cursor-paginator.helper';
import { LatestIdCursorStrategy } from '@pagination/strategies';
import { ApiLocalizedException } from '@common/exceptions';
import { CreateUserDto, SearchUserQueryDto, UpdateProfileDto } from './dto';
import {
  HydratedUser,
  userArgs,
  DryUser,
  FollowIncludeFollower,
  FollowIncludeFollowing
} from './types';
import { ISafeUser } from './interfaces';

@Injectable()
export class UsersService {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly prismaService: PrismaService,
    private readonly mediaService: MediaService
  ) {}

  async isUsernameOrEmailAvailable(usernameOrEmail: string): Promise<void> {
    try {
      await this.findUserByUsernameOrEmail(usernameOrEmail);
      throw isEmail(usernameOrEmail)
        ? new ApiLocalizedException(
            HttpStatus.CONFLICT,
            'users.email-already-exists',
            { args: { email: usernameOrEmail } }
          )
        : new ApiLocalizedException(
            HttpStatus.CONFLICT,
            'users.username-already-exists',
            { args: { userIdOrUsername: usernameOrEmail } }
          );
    } catch (error) {
      if (
        error instanceof ApiLocalizedException &&
        error.getStatus() === HttpStatus.NOT_FOUND
      ) {
        return;
      }
      throw error;
    }
  }

  async findUserById(userId: string): Promise<User> {
    try {
      return await this.prismaService.user.findFirstOrThrow({
        where: { OR: [{ id: userId }, { username: userId.toLowerCase() }] }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ApiLocalizedException(
          HttpStatus.NOT_FOUND,
          'users.not-found',
          { args: { userIdOrUsername: userId } }
        );
      }
      throw error;
    }
  }

  async findUserByUsernameOrEmail(usernameOrEmail: string): Promise<User> {
    try {
      return await this.prismaService.user.findFirstOrThrow({
        where: {
          OR: [
            { username: usernameOrEmail.toLowerCase() },
            { email: usernameOrEmail.toLowerCase() }
          ]
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw isEmail(usernameOrEmail)
          ? new ApiLocalizedException(
              HttpStatus.NOT_FOUND,
              'users.email-not-exists',
              { args: { email: usernameOrEmail } }
            )
          : new ApiLocalizedException(HttpStatus.NOT_FOUND, 'users.not-found', {
              args: { userIdOrUsername: usernameOrEmail }
            });
      }
      throw error;
    }
  }

  async getUserById(
    userId: string,
    authenticatedUserId: string
  ): Promise<HydratedUser> {
    try {
      const user = await this.prismaService.user.findFirstOrThrow({
        where: { OR: [{ id: userId }, { username: userId.toLowerCase() }] },
        include: {
          ...userArgs.include,
          followers: { where: { followerId: authenticatedUserId } }
        }
      });
      return this.hydrateUser(authenticatedUserId, user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ApiLocalizedException(
          HttpStatus.NOT_FOUND,
          'users.not-found',
          { args: { userIdOrUsername: userId } }
        );
      }
      throw error;
    }
  }

  async getUsersBySearch(
    authenticatedUserId: string,
    searchUserQueryDto: SearchUserQueryDto,
    cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<HydratedUser>> {
    const { data, pagination } = await cursorPaginator(
      cursorPaginationQueryDto
    )<HydratedUser, Prisma.UserFindManyArgs>(
      this.prismaService.user,
      LatestIdCursorStrategy,
      {
        include: { ...userArgs.include },
        where: {
          OR: [
            {
              username: {
                contains: searchUserQueryDto.search,
                mode: 'insensitive'
              }
            },
            {
              profile: {
                fullName: {
                  contains: searchUserQueryDto.search,
                  mode: 'insensitive'
                }
              }
            }
          ]
        }
      }
    );
    return {
      data: data.map((user) => this.hydrateUser(authenticatedUserId, user)),
      pagination
    };
  }

  async getSuggestedUsers(
    authenticatedUserId: string
  ): Promise<HydratedUser[]> {
    const data = await this.prismaService.user.findMany({
      where: {
        id: { not: authenticatedUserId },
        followers: { none: { followerId: authenticatedUserId } },
        verified: true
      },
      include: {
        ...userArgs.include,
        followers: false
      },
      orderBy: [
        { followers: { _count: 'desc' } },
        { followings: { _count: 'asc' } }
      ],
      take: 10
    });
    return data.map((user) =>
      this.hydrateUser(authenticatedUserId, { ...user, followers: [] })
    );
  }

  async getFollowers(
    userId: string,
    authenticatedUserId: string,
    cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<HydratedUser>> {
    const user = await this.findUserById(userId);
    const { data, pagination } = await cursorPaginator(
      cursorPaginationQueryDto
    )<FollowIncludeFollower, Prisma.FollowFindManyArgs>(
      this.prismaService.follow,
      LatestIdCursorStrategy,
      {
        include: {
          follower: {
            include: {
              ...userArgs.include,
              followers: { where: { followerId: authenticatedUserId } }
            }
          }
        },
        where: { followingId: user.id }
      }
    );
    return {
      data: data.map((follow) =>
        this.hydrateUser(authenticatedUserId, follow.follower)
      ),
      pagination
    };
  }

  async getFollowings(
    userId: string,
    authenticatedUserId: string,
    cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<HydratedUser>> {
    const user = await this.findUserById(userId);
    const { data, pagination } = await cursorPaginator(
      cursorPaginationQueryDto
    )<FollowIncludeFollowing, Prisma.FollowFindManyArgs>(
      this.prismaService.follow,
      LatestIdCursorStrategy,
      {
        include: {
          following: {
            include: {
              ...userArgs.include,
              followers: { where: { followerId: authenticatedUserId } }
            }
          }
        },
        where: { followerId: user.id }
      }
    );
    return {
      data: data.map((follow) =>
        this.hydrateUser(authenticatedUserId, follow.following)
      ),
      pagination
    };
  }

  async createUser(createUserDto: CreateUserDto): Promise<ISafeUser> {
    try {
      const { secret, ...user } = await this.prismaService.user.create({
        data: this.mapper.map<CreateUserDto, Prisma.UserCreateInput>(
          createUserDto,
          'CreateUserDto',
          'PrismaCreateUser'
        )
      });
      return user;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target = error.meta?.target as string[];
        if (target.includes('username')) {
          throw new ApiLocalizedException(
            HttpStatus.CONFLICT,
            'users.username-already-exists',
            { args: { username: createUserDto.username } }
          );
        }
        if (target.includes('email')) {
          throw new ApiLocalizedException(
            HttpStatus.CONFLICT,
            'users.email-already-exists',
            { args: { email: createUserDto.email } }
          );
        }
      }
      throw error;
    }
  }

  async updateProfile(updateProfileDto: UpdateProfileDto): Promise<void> {
    if (Object.keys(updateProfileDto).length === 1) {
      return;
    }
    const attachments = [updateProfileDto.propicId, updateProfileDto.coverId]
      .map((id) => (id ? { type: MediaType.IMAGE, id } : null))
      .filter((item) => item !== null);
    await this.mediaService.validateAttachments(
      attachments ?? [],
      updateProfileDto.id
    );
    await this.prismaService.profile.update({
      data: this.mapper.map(
        updateProfileDto,
        'UpdateProfileDto',
        'PrismaUpdateProfile'
      ),
      where: { id: updateProfileDto.id }
    });
  }

  async follow(
    authenticatedUserId: string,
    followingId: string
  ): Promise<void> {
    const user = await this.findUserById(followingId);
    if (authenticatedUserId === user.id) {
      throw new ApiLocalizedException(
        HttpStatus.BAD_REQUEST,
        'users.self-following'
      );
    }
    try {
      await this.prismaService.follow.create({
        data: { followerId: authenticatedUserId, followingId: user.id }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ApiLocalizedException(
          HttpStatus.CONFLICT,
          'users.already-following',
          { args: [{ userIdOrUsername: user.id }] }
        );
      }
      throw error;
    }
  }

  async unfollow(
    authenticatedUserId: string,
    followingId: string
  ): Promise<void> {
    const user = await this.findUserById(followingId);
    if (authenticatedUserId === user.id) {
      throw new ApiLocalizedException(
        HttpStatus.BAD_REQUEST,
        'users.self-unfollowing',
        {
          args: [{ followingId: user.id }, { authenticatedUserId }]
        }
      );
    }
    try {
      await this.prismaService.follow.delete({
        where: {
          followingId_followerId: {
            followingId: user.id,
            followerId: authenticatedUserId
          }
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ApiLocalizedException(
          HttpStatus.BAD_REQUEST,
          'users.not-following',
          { args: [{ userIdOrUsername: followingId }] }
        );
      }
      throw error;
    }
  }

  private hydrateUser(
    authenticatedUserId: string,
    user: DryUser
  ): HydratedUser {
    if (user.id === authenticatedUserId) {
      return user;
    }
    const relation = { followed: user.followers.length > 0 };
    return { ...user, relation };
  }
}
