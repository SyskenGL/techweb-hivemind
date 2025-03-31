import { Prisma } from '@prisma/client';

export type CommentMetric = Prisma.CommentCountOutputType & {
  upVotes: number;
};
