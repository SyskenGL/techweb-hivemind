import { Prisma } from '@prisma/client';

export const buzzMediaArgs = Object.freeze(
  Prisma.validator<Prisma.BuzzMediaFindManyArgs>()({
    select: { order: true, image: true },
    orderBy: { order: 'asc' }
  })
);

export type BuzzMedia = Prisma.BuzzMediaGetPayload<typeof buzzMediaArgs>;
