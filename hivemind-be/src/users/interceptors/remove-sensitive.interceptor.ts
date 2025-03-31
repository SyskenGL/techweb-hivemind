import { IJwtPayload } from '@auth/interfaces';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserDto } from '@users/dto';

@Injectable()
export class RemoveSensitiveInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as IJwtPayload;
    return next.handle().pipe(
      map((data) => {
        if ('pagination' in data) {
          return {
            ...data,
            data: data.data.map((item: UserDto) =>
              this.removeSensitive(user.sub, item)
            )
          };
        }
        if (Array.isArray(data)) {
          return data.map((item: UserDto) =>
            this.removeSensitive(user.sub, item)
          );
        }
        return this.removeSensitive(user.sub, data);
      })
    );
  }

  private removeSensitive(authenticatedUserId: string, user: UserDto): UserDto {
    if (authenticatedUserId !== user.id) {
      const { email, ...rest } = user;
      return rest;
    }
    return user;
  }
}
