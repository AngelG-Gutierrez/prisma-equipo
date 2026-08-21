import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Public } from '../../core/decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

// --- ÚNICAS MODIFICACIONES NECESARIAS (SWAGGER) ---
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LoginDto } from '../../auth/dto/login.dto';
import { LoginResponse } from '../../auth/entities/login-response';
// ---------------------------------------------------

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticación de usuario' })
  @ApiOkResponse({ type: LoginResponse })
  signIn(@Request() req, @Body() credential: LoginDto) {
    return this.authService.login(req.user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return req.logout();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('test-seguridad')
  probarRutaProtegida(@Request() req) {
    return {
      mensaje: '¡Éxito! Lograste entrar al área restringida de SINERGIA APP.',
      datosDecodificados: req.user,
    };
  }
}
