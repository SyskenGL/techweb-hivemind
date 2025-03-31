import { CursorPaginationMetaDto } from '../dto';

export interface IPaginatedResult<T> {
  data: T[];
  pagination: CursorPaginationMetaDto;
}
