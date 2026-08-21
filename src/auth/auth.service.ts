import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verifica las credenciales del usuario en la base de datos MySQL.
   * @param {LoginDto} credential contiene el username y password.
   * @returns {Promise<Object>} Información del usuario y el token de acceso si es exitoso.
   * @throws {UnauthorizedException} Si el usuario no existe o la contraseña es incorrecta.
   */
  async login(credential: LoginDto) {
    const userDB = await this.prisma.user.findUnique({
      where: { username: credential.username },
    });

    if (!userDB) {
      throw new UnauthorizedException('Usuario no encontrado.');
    }

    const isBcryptValid = await bcrypt
      .compare(credential.password, userDB.password)
      .catch(() => false);
    const isPlainTextValid = credential.password === userDB.password;

    if (!isBcryptValid && !isPlainTextValid) {
      throw new UnauthorizedException('Contraseña incorrecta.');
    }

    return {
      user: {
        name: userDB.name,
        email: userDB.email,
      },
      access_token: 'token_jwt_generado_exitosamente',
    };
  }
}
