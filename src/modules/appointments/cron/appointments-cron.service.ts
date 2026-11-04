import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/core/databases/prisma.service';
import { NotificationsService } from 'src/modules/notifications/notifications.service';

@Injectable()
export class AppointmentsCronService {
  private readonly logger = new Logger(AppointmentsCronService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Tarea programada que se ejecuta automáticamente cada minuto.
   * Busca citas con estatus 'activa' cuya fecha y hora ya hayan pasado
   * y las cambia automáticamente a estatus 'finalizada'.
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredAppointments() {
    const now = new Date();

    try {
      const result = await this.prismaService.appointment.updateMany({
        where: {
          status: 'activa',
          date: { lt: now }, // Si la fecha de la cita es menor a la hora actual
        },
        data: {
          status: 'finalizada',
        },
      });

      if (result.count > 0) {
        this.logger.log(`Se han actualizado ${result.count} citas vencidas a estatus 'finalizada'.`);
      }
    } catch (error) {
      this.logger.error('Error al actualizar citas finalizadas:', error);
    }
  }

  /**
   * Tarea programada que se ejecuta automáticamente cada 30 minutos.
   * Escanea la base de datos en busca de citas activas proyectadas en las próximas 24 horas,
   * envía un correo electrónico de recordatorio al paciente y actualiza la bandera `reminderSent`.
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleAppointmentReminders() {
    this.logger.log('Iniciando escaneo de agenda para recordatorios de 24h...');

    const now = new Date();
    // Proyectar 24 horas en el futuro
    const targetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    try {
      const upcomingAppointments = await this.prismaService.appointment.findMany({
        where: {
          date: {
            gte: now,
            lte: targetTime,
          },
          status: 'activa',
          reminderSent: false,
        },
        include: {
          patients: {
            include: {
              patient: true, 
            },
          },
        },
      });

      if (upcomingAppointments.length === 0) {
        this.logger.log('No hay citas pendientes de notificar en esta franja.');
        return;
      }

      for (const appointment of upcomingAppointments) {
        const patientData = appointment.patients[0]?.patient;

        if (!patientData || !patientData['email']) continue;

        const formattedTime = appointment.date.toLocaleTimeString('es-MX', {
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });

        const formattedDate = appointment.date.toLocaleDateString('es-MX', {
          timeZone: 'UTC',
        });

        const subject = 'Sinergia App: Recordatorio de Cita Médica';
        const message = `Hola,\n\nTe recordamos que tienes una cita de fisioterapia el día ${formattedDate} a las ${formattedTime}.\n\nPor favor, recuerda llegar 10 minutos antes.\n\nSaludos,\nClínica Sinergia.`;
        
        const success = await this.notificationsService.sendEmail(
          patientData['email'],
          subject,
          message,
        );

        if (success) {
          await this.prismaService.appointment.update({
            where: { id: appointment.id },
            data: { reminderSent: true },
          });
          this.logger.log(`Recordatorio registrado en DB para cita ID: ${appointment.id}`);
        }
      }
    } catch (error) {
      this.logger.error('Falla crítica en el Cron Job de Citas:', error);
    }
  }
}