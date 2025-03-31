import { HttpStatus } from '@nestjs/common';
import { ApiLocalizedException } from '@common/exceptions';

export abstract class BaseCursorStrategy<T, C> {
  abstract getCursor(result: T[]): string | null;

  abstract parseCursor(cursor?: string): {
    where?: any;
    orderBy: any;
  };

  abstract validate(values: C): boolean;

  abstract transform(values: string[]): C;

  protected encode(...values: string[]): string {
    return Buffer.from(values.join('::')).toString('base64url');
  }

  protected decode(cursor: string): C {
    const values = Buffer.from(cursor, 'base64url').toString().split('::');
    const transformed = this.transform(values);
    if (!this.validate(transformed)) {
      throw new ApiLocalizedException(
        HttpStatus.BAD_REQUEST,
        'general.invalid-cursor'
      );
    }
    return transformed;
  }
}
