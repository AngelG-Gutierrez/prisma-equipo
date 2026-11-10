import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/databases/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { PushNotificationsService } from '../notifications/push-notifications.service';

@Injectable()
export class PrescriptionsService {
  private readonly logger = new Logger(PrescriptionsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly pushNotificationsService: PushNotificationsService,
  ) { }

  async create(dto: CreatePrescriptionDto) {
    const prescription = await this.prismaService.prescription.create({
      data: dto,
    });

    // Buscamos al paciente para obtener su correo
    const patient = await this.prismaService.user.findUnique({
      where: { id: dto.patientId },
    });

    if (patient) {
      const subject = 'Nueva indicación de ejercicio asignada';
      const message =
        `Hola ${patient.name}, se te ha asignado un nuevo ejercicio:\n\n` +
        `Ejercicio: ${prescription.exerciseName}\n` +
        `Descripción: ${prescription.description}\n` +
        `Frecuencia: ${prescription.frequency}\n\n` +
        `Ingresa a la plataforma para más detalles.`;

      const sent = await this.notificationsService.sendEmail(
        patient.email,
        subject,
        message,
      );

      if (!sent) {
        this.logger.warn(
          `La prescripción se creó pero el correo no pudo enviarse a ${patient.email}`,
        );
      }
    } else {
      this.logger.warn(
        `No se encontró paciente con id ${dto.patientId}, no se envió notificación.`,
      );
    }

    // Crear una notificación push cuando se asigna
    // un nuevo ejercicio al paciente.
    try {
      await this.pushNotificationsService.sendNotification({
        userId: dto.patientId,
        type: 'EXERCISE_PLAN_ASSIGNED',
        title: 'Nuevo plan de ejercicios',
        body: `Se te ha asignado un nuevo ejercicio: ${prescription.exerciseName}`,
        referenceId: prescription.id,
      });
    } catch (error) {
      this.logger.error(
        'La prescripción se creó, pero falló la notificación push',
        error instanceof Error ? error.stack : String(error),
      );
    }

    return prescription;
  }

  async findByPatient(patientId: string) {
    return this.prismaService.prescription.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
