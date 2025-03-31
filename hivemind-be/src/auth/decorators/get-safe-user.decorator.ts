import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ISafeUser } from '@users/interfaces';

export const GetSafeUser = createParamDecorator(
  (_: undefined, context: ExecutionContext): ISafeUser => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user;
  }
);
