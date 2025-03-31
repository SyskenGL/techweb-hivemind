import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiLocalizedException extends HttpException {
  constructor(
    status: HttpStatus,
    i18nKey: string,
    args: Record<string, unknown> = {}
  ) {
    super({ i18nKey, args }, status);
  }
}
