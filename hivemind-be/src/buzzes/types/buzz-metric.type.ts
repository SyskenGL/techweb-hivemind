import { Prisma } from '@prisma/client';

export type BuzzMetric = Omit<
  Prisma.BuzzCountOutputType,
  'media' | 'hashtags' | 'bookmarks'
> & {
  upVotes: number;
};
