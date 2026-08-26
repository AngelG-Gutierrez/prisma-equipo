import { CreateUserDto } from '../users/dto/create-user.dto';
import { Public } from '../../core/decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
<<<<<<< HEAD
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags("Autenticación")
=======
import { 
  ApiTags, 
  ApiOperation, 
  ApiBody, 
  ApiOkResponse, 
  ApiCreatedResponse, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('Auth') // Agrupa estos endpoints en la sección "Auth" de Swagger
>>>>>>> ccc5456b70603c683db94415f80c80490c9c99e2
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

<<<<<<< HEAD
  @Public()
=======
  @ApiOperation({ summary: 'Registrar un nuevo usuario en el sistema' })
  @ApiCreatedResponse({ description: 'El usuario ha sido registrado exitosamente.' })
  @Public() 
>>>>>>> ccc5456b70603c683db94415f80c80490c9c99e2
  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

<<<<<<< HEAD
  @Public()
  @UseGuards(LocalAuthGuard)
=======
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
>>>>>>> ccc5456b70603c683db94415f80c80490c9c99e2

  @Public()
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