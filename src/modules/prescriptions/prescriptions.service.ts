import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/core/databases/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { NotificationsService } from '../notifications/notifications.service'; 

@Injectable()
export class PrescriptionsService {
  private readonly logger = new Logger(PrescriptionsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

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

    return prescription;
  }

  async findByPatient(patientId: string) {
    return this.prismaService.prescription.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }
}