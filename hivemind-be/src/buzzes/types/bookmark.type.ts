import { Prisma } from '@prisma/client';
import { buzzArgs } from './buzz.type';

export const bookmarkArgs = (authenticatedUserId?: string) =>
  Object.freeze(
    Prisma.validator<Prisma.BookmarkFindManyArgs>()({
      include: { buzz: buzzArgs(authenticatedUserId) }
    })
  );

const _bookmarkArgs = bookmarkArgs();

export type Bookmark = Prisma.BookmarkGetPayload<typeof _bookmarkArgs>;
