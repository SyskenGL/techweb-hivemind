import { BaseCursorStrategy } from './base-cursor.strategy';

export class LatestIdCursorStrategy<
  T extends { id: string }
> extends BaseCursorStrategy<T, { id: string }> {
  validate(values: { id: string }): boolean {
    return values.id !== undefined;
  }

  transform(values: string[]): { id: string } {
    return { id: values[0] };
  }

  getCursor(result: T[]): string | null {
    if (result.length === 0) {
      return null;
    }
    const last = result.at(-1)!;
    return this.encode(last.id);
  }

  parseCursor(cursor?: string): {
    where?: { id: { gt: string } } | { id: { lt: string } };
    orderBy: { id: 'desc' };
  } {
    let where: { id: { gt: string } } | { id: { lt: string } } | undefined;
    if (cursor) {
      const { id } = this.decode(cursor);
      where = { id: { lt: id } };
    }
    return {
      where,
      orderBy: { id: 'desc' }
    };
  }
}
