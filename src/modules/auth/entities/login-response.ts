import { ApiProperty } from '@nestjs/swagger';

export class UserLogued {
  @ApiProperty({ description: 'Nombre del usuario' })
  name: string;

  @ApiProperty({ description: 'Correo electrónico del usuario' })
  email: string;
}

/**
 * Tipo de respuesta al autenticar usuario
 */
export class LoginResponse {
  @ApiProperty({ description: 'Información del usuario autenticado' })
  user: UserLogued;

  @ApiProperty({ description: 'Token JWT para acceder a rutas protegidas' })
  access_token: string;
}
