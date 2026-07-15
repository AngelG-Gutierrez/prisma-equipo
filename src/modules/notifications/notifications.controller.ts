import { Controller, Get } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('test')
  async testNotification() {
    // Endpoint para probar el envío de notificaciones
    await this.notificationsService.sendEmail(
      'genaroutv@gmail.com',
      'Prueba de Integración',
      'Este es un mensaje de prueba desde el controlador de NestJS.',
    );

    return {
      success: true,
      message:
        'La solicitud fue recibida, revisa los logs en tu terminal y tu bandeja de entrada.',
    };
  }
}
