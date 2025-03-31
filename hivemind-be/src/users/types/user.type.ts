import { Prisma } from '@prisma/client';
import { UserRelationDto } from '@users/dto';

export const userArgs = Object.freeze(
  Prisma.validator<Prisma.UserDefaultArgs>()({
    include: {
      profile: true,
      _count: { select: { followers: true, followings: true, buzzes: true } },
      followers: true
    }
  })
);

export const userPreviewArgs = (authenticatedUserId?: string) =>
  Object.freeze(
    Prisma.validator<Prisma.UserDefaultArgs>()({
      select: {
        id: true,
        username: true,
        verified: true,
        profile: { select: { fullName: true, propicId: true } },
        followers: { where: { followerId: authenticatedUserId } }
      }
    })
  );

const _userPreviewArgs = userPreviewArgs();

export type DryUser = Prisma.UserGetPayload<typeof userArgs>;

export type HydratedUser = Prisma.UserGetPayload<typeof userArgs> & {
  relation?: UserRelationDto;
};

export type PartialUser = Prisma.UserGetPayload<typeof _userPreviewArgs> & {
  relation?: UserRelationDto;
};
