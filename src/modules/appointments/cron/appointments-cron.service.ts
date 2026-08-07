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

  // Se ejecuta automáticamente cada 30 minutos
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
          status: 'activa',    // estatus
          reminderSent: false, // Campo de la migración para evitar duplicados
        },
        include: {
          // Extraer el correo del paciente
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
        // Extraemos al paciente
        const patientData = appointment.patients[0]?.patient;

        // Si por alguna razón no hay paciente o correo, saltamos al siguiente
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
        // Se envía correo
        const success = await this.notificationsService.sendEmail(
          patientData['email'],
          subject,
          message,
        );

        // Actualizar la base de datos SÓLO si el correo salió con éxito
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