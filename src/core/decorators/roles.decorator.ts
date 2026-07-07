import { SetMetadata } from '@nestjs/common';

// Definimos una llave constante para evitar errores de tipeo
export const ROLES_KEY = 'roles';

// Exportamos el decorador que recibirá un arreglo de strings (los roles permitidos)
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);