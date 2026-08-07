import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    //Obtención de roles requeridos
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si la ruta no está protegida con el decorador @Roles, dejamos pasar
    if (!requiredRoles) {
      return true; 
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user; // User de JwtStrategy
    
    // Verificamos que el usuario exista
    if (!user) {
        throw new ForbiddenException('Usuario no autenticado en el sistema.');
    }

    // Valida si el rol del usuario actual está dentro del arreglo de roles permitidos
    const hasRole = requiredRoles.includes(user.role);

    // Si no tiene el rol, bloquea acceso
    if (!hasRole) {
      throw new ForbiddenException(
        `Acceso denegado: Este endpoint requiere privilegios de ${requiredRoles.join(' o ')}.`
      );
    }
    
    // Si todo está en orden, permitimos la ejecución del controlador
    return true;
  }
}