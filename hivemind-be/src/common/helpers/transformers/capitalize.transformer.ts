import { Transform } from 'class-transformer';

export function Capitalize() {
  return Transform(({ value }) =>
    typeof value === 'string'
      ? value.replace(/\b\w/g, (char) => char.toUpperCase())
      : value
  );
}
