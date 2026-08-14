import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaClient } from '@prisma/client';
import { NotificationsService } from '../../../modules/notifications/notifications.service';

@Injectable()
export class AppointmentsCronService {
  private readonly logger = new Logger(AppointmentsCronService.name);
  private readonly prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  constructor(private readonly notificationsService: NotificationsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleAppointmentReminders() {
    this.logger.debug('Ejecutando tarea programada: Recordatorios de citas...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        date: {
          gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
          lte: new Date(tomorrow.setHours(23, 59, 59, 999)),
        },
        status: 'activa',
      },
      include: {
        patients: {
          include: { patient: true },
        },
      },
    });

    for (const appointment of upcomingAppointments) {
      this.logger.log(`Enviando recordatorio para la cita ID: ${appointment.id}`);
      // Aquí invocas tu servicio de notificaciones si lo requieres
    }
  }
}