import { Transform } from 'class-transformer';

export function RemoveExtraNewlines() {
  return Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/(\r\n|\r|\n)+/g, '\n') : value
  );
}
