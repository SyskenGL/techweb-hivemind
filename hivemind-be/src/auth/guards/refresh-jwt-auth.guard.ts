import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RefreshDto } from '@auth/dto';
import { ApiLocalizedException } from '@common/exceptions';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('refresh-jwt') {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const body = plainToClass(RefreshDto, request.body);
    const errors = await validate(body, {
      skipMissingProperties: false,
      stopAtFirstError: true
    });
    if (errors.length > 0) {
      const message = errors
        .map((error) => Object.values(error.constraints ?? {}).join('; '))
        .join('; ');
      throw new ApiLocalizedException(
        HttpStatus.BAD_REQUEST,
        'general.bad-request',
        { args: { constraints: message } }
      );
    }
    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  handleRequest(error: any, user: any, info: any): any {
    if (info?.name === 'TokenExpiredError') {
      throw new ApiLocalizedException(
        HttpStatus.UNAUTHORIZED,
        'auth.expired-jwt'
      );
    }
    if (error || !user) {
      throw (
        error ||
        new ApiLocalizedException(HttpStatus.UNAUTHORIZED, 'auth.invalid-jwt')
      );
    }
    return user;
  }
}
