import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthContext {
  userId: string;
  companyId: string;
  role: string;
  email: string;
}

export const AuthContext = createParamDecorator(
  (data: keyof AuthContext | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authContext = request.authContext;

    if (!authContext) {
      return null;
    }

    return data ? authContext[data] : authContext;
  },
);

