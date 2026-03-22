import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/** Extrai o usuário autenticado da requisição */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
