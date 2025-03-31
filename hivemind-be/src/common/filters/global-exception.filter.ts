import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { I18nService, I18nValidationException } from 'nestjs-i18n';
import { ApiLocalizedException } from '@common/exceptions';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(GlobalExceptionFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly i18nService: I18nService
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.warn(
      `Handling an exception encountered while processing a request - [${exception}]`
    );
    if (exception instanceof ApiLocalizedException) {
      this.handleApiLocalizedException(exception, host);
    } else if (exception instanceof I18nValidationException) {
      this.handleI18nValidationException(exception, host);
    } else {
      this.handleGenericException(exception, host);
    }
  }

  private handleApiLocalizedException(
    exception: ApiLocalizedException,
    host: ArgumentsHost
  ) {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();
    const { i18nKey, args } = exception.getResponse() as any;
    httpAdapter.reply(
      context.getResponse(),
      {
        timestamp: new Date().toISOString(),
        code: this.i18nService.t(`errors.${i18nKey}.code`),
        message: this.i18nService.t(`errors.${i18nKey}.message`, args),
        path: httpAdapter.getRequestUrl(context.getRequest())
      },
      exception.getStatus()
    );
  }

  private handleI18nValidationException(
    exception: I18nValidationException,
    host: ArgumentsHost
  ) {
    const message = exception.errors
      .map((error) => Object.values(error.constraints ?? {}).join('; '))
      .join('; ');
    this.handleApiLocalizedException(
      new ApiLocalizedException(
        HttpStatus.BAD_REQUEST,
        this.i18nService.t('general.bad-request'),
        { args: { constraints: message } }
      ),
      host
    );
  }

  private handleGenericException(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof BadRequestException) {
      this.handleApiLocalizedException(
        new ApiLocalizedException(
          HttpStatus.BAD_REQUEST,
          this.i18nService.t('general.bad-request'),
          { args: { constraints: [] } }
        ),
        host
      );
    } else if (exception instanceof NotFoundException) {
      this.handleApiLocalizedException(
        new ApiLocalizedException(
          HttpStatus.NOT_FOUND,
          this.i18nService.t('general.bad-request'),
          { args: { constraints: [] } }
        ),
        host
      );
    } else {
      this.handleApiLocalizedException(
        new ApiLocalizedException(
          HttpStatus.INTERNAL_SERVER_ERROR,
          this.i18nService.t('general.internal')
        ),
        host
      );
    }
  }
}
