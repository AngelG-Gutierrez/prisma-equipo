import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from 'src/core/databases/prisma.service';
import { AppointmentsCronService } from './cron/appointments-cron.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule], 
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService, 
    AppointmentsCronService, 
    PrismaService
  ],
})
export class AppointmentsModule {}