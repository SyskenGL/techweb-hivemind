export interface CursorPageDto<T> {
  data: T[];
  pagination: { cursor: string | null };
}
