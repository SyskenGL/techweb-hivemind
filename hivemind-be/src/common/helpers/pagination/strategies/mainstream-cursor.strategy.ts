import { Prisma, BuzzEngagement } from '@prisma/client';
import { BaseCursorStrategy } from './base-cursor.strategy';

interface MainstreamCursor {
  voteBalance: number;
  controversy: Prisma.Decimal;
  upvoteCount: number;
  downvoteCount: number;
  id: string;
}

export class MainstreamCursorStrategy extends BaseCursorStrategy<
  BuzzEngagement,
  MainstreamCursor
> {
  validate(values: MainstreamCursor): boolean {
    const { voteBalance, controversy, upvoteCount, downvoteCount, id } = values;
    return (
      [voteBalance, controversy, upvoteCount, downvoteCount, id].every(
        (v) => v !== undefined
      ) &&
      !isNaN(voteBalance) &&
      !controversy.isNaN() &&
      !isNaN(upvoteCount) &&
      !isNaN(downvoteCount)
    );
  }

  transform(values: string[]): MainstreamCursor {
    const [voteBalance, controversy, upvoteCount, downvoteCount, id] = values;
    return {
      voteBalance: +voteBalance,
      controversy: new Prisma.Decimal(controversy),
      upvoteCount: +upvoteCount,
      downvoteCount: +downvoteCount,
      id
    };
  }

  getCursor(result: BuzzEngagement[]): string | null {
    if (result.length === 0) {
      return null;
    }
    const last = result.at(-1)!;
    return this.encode(
      last.voteBalance.toString(),
      last.controversy.toString(),
      last.upvoteCount.toString(),
      last.downvoteCount.toString(),
      last.id
    );
  }

  parseCursor(cursor?: string): {
    where?: Prisma.BuzzEngagementWhereInput;
    orderBy: Prisma.BuzzEngagementOrderByWithRelationInput[];
  } {
    let where: Prisma.BuzzEngagementWhereInput | undefined;
    if (cursor) {
      const { voteBalance, controversy, upvoteCount, downvoteCount, id } =
        this.decode(cursor);
      where = {
        OR: [
          { voteBalance: { lt: +voteBalance } },
          {
            voteBalance: +voteBalance,
            controversy: { gt: new Prisma.Decimal(controversy) }
          },
          {
            voteBalance: +voteBalance,
            controversy: new Prisma.Decimal(controversy),
            upvoteCount: { lt: +upvoteCount }
          },
          {
            voteBalance: +voteBalance,
            controversy: new Prisma.Decimal(controversy),
            upvoteCount: +upvoteCount,
            downvoteCount: { gt: +downvoteCount }
          },
          {
            voteBalance: +voteBalance,
            controversy: new Prisma.Decimal(controversy),
            upvoteCount: +upvoteCount,
            downvoteCount: +downvoteCount,
            id: { lt: id }
          }
        ]
      };
    }
    return {
      where,
      orderBy: [
        { voteBalance: 'desc' },
        { controversy: 'asc' },
        { upvoteCount: 'desc' },
        { downvoteCount: 'asc' },
        { id: 'desc' }
      ]
    };
  }
}
