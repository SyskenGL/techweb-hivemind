import {
  Body,
  Controller,
  Delete,
  Get,
  Head,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath
} from '@nestjs/swagger';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ApiPaginatedCursor } from '@pagination/decorators';
import { CursorPaginationQueryDto } from '@pagination/dto';
import { IPaginatedResult } from '@pagination/interfaces';
import { GetSub, Public } from '@auth/decorators';
import { UsersService } from './users.service';
import { RemoveSensitiveInterceptor } from './interceptors';
import { UserDto, UpdateProfileDto, SearchUserQueryDto } from './dto';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(
    @InjectMapper() private readonly mapper: Mapper,
    private readonly usersService: UsersService
  ) {}

  @Head()
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Verifies whether the provided username or email is available.'
  })
  async isUsernameOrEmailAvailable(
    @Query('usernameOrEmail') usernameOrEmail: string
  ): Promise<void> {
    await this.usersService.isUsernameOrEmailAvailable(usernameOrEmail);
  }

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(RemoveSensitiveInterceptor)
  @ApiOperation({
    summary:
      'Retrieves the details of an user given either their id or username.'
  })
  @ApiOkResponse({ type: UserDto })
  async getUserById(
    @Param('userId') userId: string,
    @GetSub() authenticatedUserId: string
  ): Promise<UserDto> {
    const result = await this.usersService.getUserById(
      userId,
      authenticatedUserId
    );
    return this.mapper.map(result, 'User', 'UserDto');
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(RemoveSensitiveInterceptor)
  @ApiOperation({
    summary:
      'Retrieves users matching the search term or the top 10 suggested users to follow.'
  })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(UserDto) }
    }
  })
  async getUsers(
    @GetSub() authenticatedUserId: string,
    @Query() searchUserQueryDto: SearchUserQueryDto,
    @Query() cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<UserDto[] | IPaginatedResult<UserDto>> {
    if (searchUserQueryDto.search) {
      const { data, pagination } = await this.usersService.getUsersBySearch(
        authenticatedUserId,
        searchUserQueryDto,
        cursorPaginationQueryDto
      );
      return {
        data: data.map((follower) =>
          this.mapper.map(follower, 'User', 'UserDto')
        ),
        pagination
      };
    } else {
      const data =
        await this.usersService.getSuggestedUsers(authenticatedUserId);
      return data.map((user) => this.mapper.map(user, 'User', 'UserDto'));
    }
  }

  @Get(':userId/followings')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(RemoveSensitiveInterceptor)
  @ApiOperation({
    summary:
      'Returns followings of an a user given either their id or username.'
  })
  @ApiPaginatedCursor({ model: UserDto })
  async getFollowings(
    @Param('userId') userId: string,
    @GetSub() authenticatedUserId: string,
    @Query() cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<UserDto>> {
    const { data, pagination } = await this.usersService.getFollowings(
      userId,
      authenticatedUserId,
      cursorPaginationQueryDto
    );
    return {
      data: data.map((follower) =>
        this.mapper.map(follower, 'User', 'UserDto')
      ),
      pagination
    };
  }

  @Get(':userId/followers')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(RemoveSensitiveInterceptor)
  @ApiOperation({
    summary: 'Returns followers of an user given either their id or username.'
  })
  @ApiPaginatedCursor({ model: UserDto })
  async getFollowers(
    @Param('userId') userId: string,
    @GetSub() authenticatedUserId: string,
    @Query() cursorPaginationQueryDto: CursorPaginationQueryDto
  ): Promise<IPaginatedResult<UserDto>> {
    const { data, pagination } = await this.usersService.getFollowers(
      userId,
      authenticatedUserId,
      cursorPaginationQueryDto
    );
    return {
      data: data.map((follower) =>
        this.mapper.map(follower, 'User', 'UserDto')
      ),
      pagination
    };
  }

  @Patch()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Updates profile of the currently authenticated user.'
  })
  @ApiBody({ type: UpdateProfileDto })
  async updateUserProfile(
    @GetSub() authenticatedUserId: string,
    @Body() updateProfileDto: UpdateProfileDto
  ): Promise<void> {
    await this.usersService.updateProfile({
      ...updateProfileDto,
      id: authenticatedUserId
    });
  }

  @Post(':userId/followers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Follows an user given either their id or username.'
  })
  async follow(
    @Param('userId') userId: string,
    @GetSub() authenticatedUserId: string
  ): Promise<void> {
    return this.usersService.follow(authenticatedUserId, userId);
  }

  @Delete(':userId/followers')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Unfollows an user given either their id or username.'
  })
  async unfollow(
    @Param('userId') userId: string,
    @GetSub() authenticatedUserId: string
  ): Promise<void> {
    return this.usersService.unfollow(authenticatedUserId, userId);
  }
}
