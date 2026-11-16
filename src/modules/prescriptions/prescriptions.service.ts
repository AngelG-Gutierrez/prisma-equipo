
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

import { PrismaService } from '../../core/databases/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

import { NotificationsService } from '../notifications/notifications.service';
import { PushNotificationsService } from '../notifications/push-notifications.service';

@Injectable()
export class PrescriptionsService {
  private readonly logger = new Logger(PrescriptionsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  // Validar que el paciente pueda recibir prescripciones
  private async validatePatient(patientId: string) {
    const patient = await this.prismaService.user.findUnique({
      where: { id: patientId },
      include: {
        medicalRecord: {
          select: { id: true },
        },
        appointments: {
          where: {
            appointment: {
              status: 'finalizada',
            },
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!patient || patient.role !== 'Paciente' || !patient.active) {
      throw new NotFoundException(
        'No se encontró un paciente activo con ese ID.',
      );
    }

    if (!patient.medicalRecord) {
      throw new BadRequestException(
        'El paciente necesita contar con un expediente médico antes de recibir ejercicios.',
      );
    }

    if (patient.appointments.length === 0) {
      throw new BadRequestException(
        'El paciente debe haber asistido al menos a una cita finalizada antes de recibir ejercicios.',
      );
    }

    return patient;
  }

  // Crear una prescripción y enviar sus notificaciones
  async create(dto: CreatePrescriptionDto) {
    const patient = await this.validatePatient(dto.patientId);

    const prescription = await this.prismaService.prescription.create({
      data: {
        patientId: dto.patientId,
        exerciseName: dto.exerciseName,
        description: dto.description,
        frequency: dto.frequency,
        duration: dto.duration,
        equipment: dto.equipment,
        mediaUrl: dto.mediaUrl,
      },
    });

    // Notificación por correo
    const subject = 'Nueva indicación de ejercicio asignada';

    const message =
      `Hola ${patient.name}, se te ha asignado un nuevo ejercicio:\n\n` +
      `Ejercicio: ${prescription.exerciseName}\n` +
      `Descripción: ${prescription.description}\n` +
      `Frecuencia: ${prescription.frequency}\n` +
      `Duración: ${prescription.duration}\n` +
      `Material: ${prescription.equipment || 'No requiere material'}\n\n` +
      `Ingresa a la plataforma para más detalles.`;

    try {
      const sent = await this.notificationsService.sendEmail(
        patient.email,
        subject,
        message,
      );

      if (!sent) {
        this.logger.warn(
          `La prescripción se creó, pero no se pudo enviar el correo a ${patient.email}`,
        );
      }
    } catch (error) {
      this.logger.error(
        'La prescripción se creó, pero ocurrió un error al enviar el correo.',
        error instanceof Error ? error.stack : String(error),
      );
    }

    // Notificación push individual por ejercicio
    try {
      await this.pushNotificationsService.sendNotification({
        userId: dto.patientId,
        type: 'EXERCISE_PLAN_ASSIGNED',
        title: 'Nuevo ejercicio asignado',
        body: `Se te ha asignado un nuevo ejercicio: ${prescription.exerciseName}`,
        referenceId: prescription.id,
      });
    } catch (error) {
      this.logger.error(
        'La prescripción se creó, pero falló la notificación push.',
        error instanceof Error ? error.stack : String(error),
      );
    }

    return prescription;
  }

  // Consultar las prescripciones de un paciente
  async findByPatient(patientId: string) {
    return this.prismaService.prescription.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Consultar pacientes que tienen ejercicios asignados
  async findPatientsWithPrescriptions() {
    const patients = await this.prismaService.user.findMany({
      where: {
        role: 'Paciente',
        active: true,
        prescriptions: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        prescriptions: {
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            exerciseName: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const result = patients.map((patient) => ({
      id: patient.id,
      name: patient.name,
      exercisesCount: patient.prescriptions.length,
      prescriptions: patient.prescriptions,
      lastAssignedAt: patient.prescriptions[0]?.createdAt ?? null,
    }));

    return result.sort((a, b) => {
      const dateA = a.lastAssignedAt
        ? new Date(a.lastAssignedAt).getTime()
        : 0;

      const dateB = b.lastAssignedAt
        ? new Date(b.lastAssignedAt).getTime()
        : 0;

      return dateB - dateA;
    });
  }

  // Consultar una prescripción individual
  async findOne(id: string, user: { userId: string; role: string }) {
    const prescription = await this.prismaService.prescription.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!prescription) {
      throw new NotFoundException('No se encontró la prescripción solicitada.');
    }

    // El paciente solo puede consultar sus propios ejercicios
    if (
      user.role === 'Paciente' &&
      prescription.patientId !== user.userId
    ) {
      throw new ForbiddenException(
        'No tienes permiso para consultar esta prescripción.',
      );
    }

    return prescription;
  }

  // Editar una prescripción
  async update(id: string, dto: UpdatePrescriptionDto) {
    const existing = await this.prismaService.prescription.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('No se encontró la prescripción solicitada.');
    }

    return this.prismaService.prescription.update({
      where: { id },
      data: dto,
    });
  }

  // Eliminar una prescripción
  async remove(id: string) {
    const existing = await this.prismaService.prescription.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('No se encontró la prescripción solicitada.');
    }

    await this.prismaService.prescription.delete({
      where: { id },
    });

    return {
      message: 'La prescripción se eliminó correctamente.',
      id,
    };
  }
}
