import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';

import { IsIn, IsNotEmpty, IsString, Matches } from 'class-validator';

import { NotificationsService } from './notifications.service';
import { PushNotificationsService } from './push-notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { Public } from '../../core/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class RegisterPushDeviceDto {
  @ApiProperty({
    example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  })
  @IsString()
  @Matches(/^(ExpoPushToken|ExponentPushToken)\[[^\]]+\]$/)
  token: string;

  @ApiProperty({ enum: ['ios', 'android'] })
  @IsIn(['ios', 'android'])
  platform: 'ios' | 'android';
}

class DeactivatePushDeviceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}

interface AuthenticatedRequest {
  user: {
    userId: string;
    username?: string;
    role?: string;
  };
}

@ApiTags('Notificaciones')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushService: PushNotificationsService,
  ) { }

  // Endpoint original de correo electrónico
  @Public()
  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Probar envío de notificaciones por correo',
  })
  @ApiOkResponse({
    description: 'La solicitud de correo fue procesada.',
  })
  async testNotification(@Body() notificationData: SendNotificationDto) {
    const isSuccess = await this.notificationsService.sendEmail(
      notificationData.to,
      notificationData.subject,
      notificationData.body || 'Sin mensaje adicional',
    );

    return {
      success: isSuccess,
      message: 'Solicitud recibida. Revisa los logs y la bandeja de entrada.',
    };
  }

  // Registrar dispositivo push del usuario autenticado
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('devices')
  @ApiOperation({
    summary: 'Registrar dispositivo para notificaciones push',
  })
  async registerDevice(
    @Req() req: AuthenticatedRequest,
    @Body() dto: RegisterPushDeviceDto,
  ) {
    return this.pushService.registerDevice(
      req.user.userId,
      dto.token,
      dto.platform,
    );
  }

  // Desactivar dispositivo del usuario autenticado
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('devices/deactivate')
  @ApiOperation({
    summary: 'Desactivar notificaciones push de un dispositivo',
  })
  async deactivateDevice(
    @Req() req: AuthenticatedRequest,
    @Body() dto: DeactivatePushDeviceDto,
  ) {
    return this.pushService.deactivateDevice(req.user.userId, dto.token);
  }

  // Consultar historial del usuario autenticado
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Obtener historial de notificaciones',
  })
  async getNotifications(@Req() req: AuthenticatedRequest) {
    return this.pushService.getNotifications(req.user.userId);
  }

  // Marcar una notificación propia como leída
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  @ApiOperation({
    summary: 'Marcar notificación como leída',
  })
  async markAsRead(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.pushService.markAsRead(req.user.userId, id);
  }
}
