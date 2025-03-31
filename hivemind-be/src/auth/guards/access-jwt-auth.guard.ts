import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@auth/decorators';
import { ApiLocalizedException } from '@common/exceptions';
import { Observable } from 'rxjs';

@Injectable()
export class AccessJwtAuthGuard extends AuthGuard('access-jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
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
