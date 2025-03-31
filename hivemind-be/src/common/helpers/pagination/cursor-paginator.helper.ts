import { CursorPaginationQueryDto } from './dto';
import { IPaginatedResult } from './interfaces';
import { BaseCursorStrategy } from './strategies';

export const cursorPaginator = (
  cursorPaginationQueryDto: CursorPaginationQueryDto
) => {
  return async <T, K>(
    model: any,
    strategyClass: new () => BaseCursorStrategy<T, any>,
    args: K = {} as K
  ): Promise<IPaginatedResult<T>> => {
    const strategy = new strategyClass();
    const { limit, cursor } = cursorPaginationQueryDto;
    const { where, orderBy } = strategy.parseCursor(cursor);
    const data = await model.findMany({
      ...args,
      where: { ...args['where'], ...where },
      orderBy,
      take: limit + 1
    });
    const slicedData = data.slice(0, limit);
    return {
      data: slicedData,
      pagination: {
        cursor: data.length > limit ? strategy.getCursor(slicedData) : null
      }
    };
  };
};
