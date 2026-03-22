import { SetMetadata } from '@nestjs/common';
import { Role } from 'prisma/generated';


export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

export const IS_PUBLIC_KEY = 'isPublic';
/** Marca a rota como pública (sem autenticação JWT) */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
