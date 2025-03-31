import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IJwtPayload } from '@auth/interfaces';

export const GetSub = createParamDecorator(
  (_: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as IJwtPayload;
    return user.sub;
  }
);
