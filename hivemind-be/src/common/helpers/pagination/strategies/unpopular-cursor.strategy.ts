import { Prisma, BuzzEngagement } from '@prisma/client';
import { BaseCursorStrategy } from './base-cursor.strategy';

interface UnpopularCursor {
  voteBalance: number;
  controversy: Prisma.Decimal;
  upvoteCount: number;
  downvoteCount: number;
  id: string;
}

export class UnpopularCursorStrategy extends BaseCursorStrategy<
  BuzzEngagement,
  UnpopularCursor
> {
  validate(values: UnpopularCursor): boolean {
    const { voteBalance, controversy, downvoteCount, upvoteCount, id } = values;
    return (
      [voteBalance, controversy, downvoteCount, upvoteCount, id].every(
        (v) => v !== undefined
      ) &&
      !isNaN(voteBalance) &&
      !controversy.isNaN() &&
      !isNaN(upvoteCount) &&
      !isNaN(downvoteCount)
    );
  }

  transform(values: string[]): UnpopularCursor {
    const [voteBalance, controversy, downvoteCount, upvoteCount, id] = values;
    return {
      voteBalance: +voteBalance,
      controversy: new Prisma.Decimal(controversy),
      downvoteCount: +downvoteCount,
      upvoteCount: +upvoteCount,
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
      last.downvoteCount.toString(),
      last.upvoteCount.toString(),
      last.id
    );
  }

  parseCursor(cursor?: string): {
    where?: Prisma.BuzzEngagementWhereInput;
    orderBy: Prisma.BuzzEngagementOrderByWithRelationInput[];
  } {
    let where: Prisma.BuzzEngagementWhereInput | undefined;
    if (cursor) {
      let { voteBalance, controversy, downvoteCount, upvoteCount, id } =
        this.decode(cursor);
      where = {
        OR: [
          { voteBalance: { gt: +voteBalance } },
          {
            voteBalance: +voteBalance,
            controversy: { gt: new Prisma.Decimal(controversy) }
          },
          {
            voteBalance: +voteBalance,
            controversy: new Prisma.Decimal(controversy),
            downvoteCount: { lt: +downvoteCount }
          },
          {
            voteBalance: +voteBalance,
            controversy: new Prisma.Decimal(controversy),
            downvoteCount: +downvoteCount,
            upvoteCount: { gt: +upvoteCount }
          },
          {
            voteBalance: +voteBalance,
            controversy: new Prisma.Decimal(controversy),
            downvoteCount: +downvoteCount,
            upvoteCount: +upvoteCount,
            id: { lt: id }
          }
        ]
      };
    }
    return {
      where,
      orderBy: [
        { voteBalance: 'asc' },
        { controversy: 'asc' },
        { downvoteCount: 'desc' },
        { upvoteCount: 'asc' },
        { id: 'desc' }
      ]
    };
  }
}
