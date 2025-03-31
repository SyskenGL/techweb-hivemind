import { Prisma } from '@prisma/client';
import { userArgs } from './user.type';

export type FollowIncludeFollowing = Prisma.FollowGetPayload<{
  include: { following: typeof userArgs };
}>;
