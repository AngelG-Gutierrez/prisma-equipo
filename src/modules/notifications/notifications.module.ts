import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaService } from '../../core/databases/prisma.service';
import { PushNotificationsService } from './push-notifications.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'teamsinergiaapp@gmail.com',
          pass: 'lqxw uefa naqp lmdf',
        },
      },
      defaults: {
        from: '"Clínica - Sistema de Citas" <teamsinergiaapp@gmail.com>',
      },
    }),
  ],
  controllers: [NotificationsController],

  providers: [NotificationsService, PushNotificationsService, PrismaService],
  exports: [NotificationsService, PushNotificationsService],
})
export class NotificationsModule { }
