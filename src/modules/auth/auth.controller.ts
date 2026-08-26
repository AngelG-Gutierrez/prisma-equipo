import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse, ApiCreatedResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Public } from '../../core/decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './entities/login-response';

@ApiTags('Auth') // Agrupa estos endpoints en la sección "Auth" de Swagger
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @ApiOperation({ summary: 'Registrar un nuevo usuario en el sistema' })
  @ApiCreatedResponse({ description: 'El usuario ha sido registrado exitosamente.' })
  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: 'Iniciar sesión para obtener el token JWT' })
  @ApiBody({
    description: 'Credenciales de acceso del usuario',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'angelgtz99' },
        password: { type: 'string', example: 'MiPasswordSeguro123' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiOkResponse({ description: 'Inicio de sesión exitoso. Retorna el token de acceso.' })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  signIn(@Request() req) {
    return this.authService.login(req.user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión del usuario actual' })
  @ApiOkResponse({ description: 'Sesión finalizada correctamente.' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return req.logout();
  }

  @ApiBearerAuth() // Activa el candado en Swagger
  @ApiOperation({ summary: 'Probar el acceso a una ruta protegida por JWT' })
  @ApiOkResponse({ description: 'Retorna un mensaje de confirmación y los datos decodificados del token.' })
  @UseGuards(JwtAuthGuard)
  @Get('test-seguridad')
  probarRutaProtegida(@Request() req) {
    return {
      mensaje: '¡Éxito! Lograste entrar al área restringida de SINERGIA APP.',
      datosDecodificados: req.user,
    };
  }
}