import { BuzzInteractionDto } from '@buzzes/dto';
import { Prisma, VoteType } from '@prisma/client';
import { BuzzMetric } from './buzz-metric.type';
import { buzzMediaArgs } from './buzz-media.type';
import { userPreviewArgs } from '@users/types';
import { UserRelationDto } from '@users/dto';

export const buzzArgs = (authenticatedUserId?: string) =>
  Object.freeze(
    Prisma.validator<Prisma.BuzzDefaultArgs>()({
      include: {
        author: userPreviewArgs(authenticatedUserId),
        hashtags: true,
        media: buzzMediaArgs,
        _count: { select: { votes: true, comments: true } }
      }
    })
  );

export const additionalBuzzArgs = (userId?: string) =>
  Object.freeze(
    Prisma.validator<Prisma.BuzzDefaultArgs>()({
      include: {
        votes: { where: { voterId: userId } },
        _count: {
          select: {
            votes: { where: { type: VoteType.up } },
            comments: { where: { authorId: userId } },
            bookmarks: { where: { userId } }
          }
        }
      }
    })
  );

const _buzzArgs = buzzArgs();

const _additionalBuzzArgs = additionalBuzzArgs();

export type DryBuzz = Prisma.BuzzGetPayload<typeof _buzzArgs>;

export type HydratedBuzz = Prisma.BuzzGetPayload<typeof _buzzArgs> & {
  _count: BuzzMetric;
  interaction: BuzzInteractionDto;
  author: { relation?: UserRelationDto };
};

export type AdditionalBuzzData = Prisma.BuzzGetPayload<
  typeof _additionalBuzzArgs
>;
