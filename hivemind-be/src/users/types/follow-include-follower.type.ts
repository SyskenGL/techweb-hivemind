import { Prisma } from '@prisma/client';
import { userArgs } from './user.type';

export type FollowIncludeFollower = Prisma.FollowGetPayload<{
  include: { follower: typeof userArgs };
}>;
