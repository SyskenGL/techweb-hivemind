import { BuzzEngagement, Prisma } from '@prisma/client';
import { BaseCursorStrategy } from './base-cursor.strategy';

interface ControverseCursor {
  voteCount: number;
  controversy: Prisma.Decimal;
  id: string;
}

export class ControverseCursorStrategy extends BaseCursorStrategy<
  BuzzEngagement,
  ControverseCursor
> {
  validate(values: ControverseCursor): boolean {
    const { controversy, voteCount, id } = values;
    return (
      [controversy, voteCount, id].every((v) => v !== undefined) &&
      !controversy.isNaN()
    );
  }

  transform(values: string[]): ControverseCursor {
    const [voteCount, controversy, id] = values;
    return {
      voteCount: +voteCount,
      controversy: new Prisma.Decimal(controversy),
      id
    };
  }

  getCursor(result: BuzzEngagement[]): string | null {
    if (result.length === 0) {
      return null;
    }
    const last = result.at(-1)!;
    return this.encode(
      last.voteCount.toString(),
      last.controversy.toString(),
      last.id
    );
  }

  parseCursor(cursor?: string): {
    where?: Prisma.BuzzEngagementWhereInput;
    orderBy: Prisma.BuzzEngagementOrderByWithRelationInput[];
  } {
    let where: Prisma.BuzzEngagementWhereInput | undefined;
    if (cursor) {
      const { voteCount, controversy, id } = this.decode(cursor);
      where = {
        OR: [
          { voteCount: { lt: voteCount } },
          { voteCount: voteCount, controversy: { lt: controversy } },
          {
            voteCount: voteCount,
            controversy: controversy,
            id: { lt: id }
          }
        ]
      };
    }
    return {
      where,
      orderBy: [{ voteCount: 'desc' }, { controversy: 'desc' }, { id: 'desc' }]
    };
  }
}
