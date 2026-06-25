import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Public } from '../../core/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public() 
  @Post('signup')
  signUp(@Body() createUserDto: CreateUserDto) {    
    return this.authService.register(createUserDto);
  }

  @Public() 
  @UseGuards(LocalAuthGuard) 

  @Post('login')
  @HttpCode(HttpStatus.OK)
  signIn(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    return req.logout();
  }

  @UseGuards(LocalAuthGuard)
  @Get('test-seguridad')
    probarRutaProtegida(@Request() req) {
      return {
        mensaje: '¡Éxito! Lograste entrar al área restringida de SINERGIA APP.',
        datosDecodificados: req.user,
      };
    }
}