import { Prisma, VoteType } from '@prisma/client';
import { userPreviewArgs } from '@users/types';
import { UserRelationDto } from '@users/dto';
import { CommentInteractionDto } from '@comments/dto';
import { CommentMetric } from './comment-metric.type';

export const commentArgs = (authenticatedUserId?: string) =>
  Object.freeze(
    Prisma.validator<Prisma.CommentDefaultArgs>()({
      include: {
        author: userPreviewArgs(authenticatedUserId),
        _count: { select: { replies: true, votes: true } }
      }
    })
  );

export const additionalCommentArgs = (userId?: string) =>
  Object.freeze(
    Prisma.validator<Prisma.CommentDefaultArgs>()({
      include: {
        votes: { where: { voterId: userId } },
        _count: {
          select: {
            votes: { where: { type: VoteType.up } },
            replies: { where: { authorId: userId } }
          }
        }
      }
    })
  );

const _commentArgs = commentArgs();

const _additionalCommentDataArgs = additionalCommentArgs();

export type DryComment = Prisma.CommentGetPayload<typeof _commentArgs>;

export type HydratedComment = Prisma.CommentGetPayload<typeof _commentArgs> & {
  _count: CommentMetric;
  interaction: CommentInteractionDto;
  author: { relation?: UserRelationDto };
};

export type AdditionalCommentData = Prisma.CommentGetPayload<
  typeof _additionalCommentDataArgs
>;
