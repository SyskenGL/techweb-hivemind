import { Transform } from 'class-transformer';

export function ToLowercase() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value
  );
}
