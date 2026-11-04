import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

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
  providers: [NotificationsService],
  exports: [NotificationsService], // lo exporte para que los demas modulos lo usen despues
})
export class NotificationsModule {}
