import { Transform } from 'class-transformer';

export function RemoveNewlines() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/[\r\n]+/g, '') : value
  );
}
