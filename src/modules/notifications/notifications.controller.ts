import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { Public } from '../../core/decorators/public.decorator';

@ApiTags('Notificaciones')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Public()
  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Probar el envío de notificaciones por correo' })
  @ApiOkResponse({ description: 'La solicitud de correo fue procesada.' })
  async testNotification(@Body() notificationData: SendNotificationDto) {
    // datos que llegan desde Swagger
    const isSuccess = await this.notificationsService.sendEmail(
      notificationData.to,
      notificationData.subject,
      notificationData.body || 'Sin mensaje adicional',
    );

    return {
      success: isSuccess,
      message:
        'La solicitud fue recibida, revisa los logs en tu terminal y tu bandeja de entrada.',
    };
  }
}
