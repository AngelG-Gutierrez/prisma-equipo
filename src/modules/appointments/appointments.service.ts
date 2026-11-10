import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { PrismaService } from '../../core/databases/prisma.service';
import { Appointment } from './appointment';
import { Logger } from '@nestjs/common';
import { PushNotificationsService } from '../notifications/push-notifications.service';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly pushNotificationsService: PushNotificationsService,
  ) { }

  /**
   * Crea una nueva cita para un paciente validando la disponibilidad del horario (RNF_04).
   *
   * @param {string} patientId - El identificador único del paciente que solicita la cita.
   * @param {CreateAppointmentDto} dto - Objeto con los datos necesarios para crear la cita.
   * @throws {BadRequestException} Si el horario seleccionado ya tiene una cita activa.
   * @returns {Promise<Appointment>} El registro de la cita recién creada junto con su relación.
   */
  async create(patientId: string, dto: CreateAppointmentDto) {
    const appointmentDate = new Date(dto.date);

    // Verifica disponibilidad de horario (RNF_04)
    const existingAppointment = await this.prismaService.appointment.findFirst({
      where: {
        date: appointmentDate,
        status: 'activa',
      },
    });

    if (existingAppointment) {
      throw new BadRequestException(
        'El horario seleccionado ya no está disponible.',
      );
    }

    // Crear la cita y la relación en la tabla intermedia
    return this.prismaService.appointment.create({
      data: {
        date: appointmentDate,
        reason: dto.reason,
        status: 'activa',
        patients: {
          create: {
            patient: {
              connect: { id: patientId },
            },
          },
        },
      },
    });
  }

  /**
   * Cancela una cita existente verificando que pertenezca al paciente solicitante
   * y que se realice con al menos 24 horas de anticipación.
   *
   * @param {string} patientId - El identificador del paciente que intenta cancelar.
   * @param {string} appointmentId - El identificador de la cita a cancelar.
   * @throws {NotFoundException} Si la cita no existe en la base de datos.
   * @throws {ForbiddenException} Si el paciente intenta cancelar una cita que no le pertenece.
   * @throws {BadRequestException} Si se intenta cancelar con menos de 24 horas de anticipación.
   * @returns {Promise<Appointment>} El registro de la cita actualizada con estado "cancelada".
   */
  async cancel(patientId: string, appointmentId: string) {
    const appointment = await this.prismaService.appointment.findUnique({
      where: { id: appointmentId },
      include: { patients: true },
    });

    if (!appointment) throw new NotFoundException('Cita no encontrada.');

    // Valida que la cita pertenezca al paciente que hace la petición
    const isOwner = appointment.patients.some((p) => p.patientId === patientId);
    if (!isOwner)
      throw new ForbiddenException(
        'No tienes permiso para cancelar esta cita.',
      );

    // Valida la regla de las 24 horas
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    const diffInHours =
      (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      throw new BadRequestException(
        'Las citas solo pueden cancelarse con al menos 24 horas de anticipación.',
      );
    }

    // Actualiza el estado
    return this.prismaService.appointment.update({
      where: { id: appointmentId },
      data: { status: 'cancelada' },
    });
  }

  /**
   * Obtiene un listado general de todas las citas registradas en el sistema.
   *
   * @returns {Promise<Appointment[]>} Un arreglo con todas las citas.
   */
  async findAll() {
    return this.prismaService.appointment.findMany();
  }

  /**
   * Obtiene todo el historial de citas de un paciente (activas, canceladas y finalizadas)
   * para alimentar las pestañas de la app móvil.
   */
  async findAllByPatient(patientId: string) {
    return this.prismaService.appointment.findMany({
      where: {
        patients: {
          some: { patientId },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  /**
   * Obtiene las próximas citas activas de un paciente en específico, ordenadas cronológicamente.
   *
   * @param {string} patientId - El identificador del paciente.
   * @returns {Promise<Appointment[]>} Un arreglo con las futuras citas del paciente.
   */
  async findUpcomingByPatient(patientId: string) {
    const now = new Date();
    return this.prismaService.appointment.findMany({
      where: {
        patients: {
          some: { patientId },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async assignDoctor(appointmentId: string, doctorId: string) {
    const appointment = await this.prismaService.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patients: true,
        doctors: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('La cita no existe.');
    }

    if (appointment.status !== 'activa') {
      throw new BadRequestException('Solo se pueden asignar citas activas.');
    }

    if (appointment.patients.length === 0) {
      throw new BadRequestException('La cita no tiene un paciente asociado.');
    }

    if (appointment.doctors.length > 0) {
      throw new BadRequestException(
        'La cita ya tiene un fisioterapeuta asignado.',
      );
    }

    const doctor = await this.prismaService.user.findUnique({
      where: { id: doctorId },
    });

    if (!doctor || !doctor.active || doctor.role !== 'Administrador') {
      throw new BadRequestException(
        'El fisioterapeuta no existe o no está autorizado.',
      );
    }

    const assignedDoctor = await this.prismaService.doctorAppointment.create({
      data: {
        appointmentId,
        doctorId,
      },
    });

    try {
      await this.pushNotificationsService.sendNotification({
        userId: doctor.id,
        type: 'APPOINTMENT_CREATED',
        title: 'Nueva cita asignada',
        body: `Se te ha asignado una cita para el ${appointment.date.toLocaleString(
          'es-MX',
          {
            timeZone: 'America/Mexico_City',
          },
        )}.`,
        referenceId: appointment.id,
      });
    } catch (error) {
      this.logger.error(
        'La cita fue asignada, pero no se pudo generar la notificación.',
        error instanceof Error ? error.stack : String(error),
      );
    }

    return {
      message: 'Fisioterapeuta asignado correctamente.',
      appointmentId,
      doctorId: assignedDoctor.doctorId,
    };
  }

  async createByDoctor(
    doctorId: string,
    patientId: string,
    date: string,
    reason: string,
  ) {
    // Verificar al fisioterapeuta autenticado.
    const doctor = await this.prismaService.user.findUnique({
      where: { id: doctorId },
    });

    if (!doctor || !doctor.active || doctor.role !== 'Administrador') {
      throw new ForbiddenException('No tienes permisos para programar citas.');
    }

    // Comprobar que el paciente existe.
    const patient = await this.prismaService.user.findUnique({
      where: { id: patientId },
    });

    if (!patient || !patient.active || patient.role !== 'Paciente') {
      throw new NotFoundException('El paciente no existe o no está activo.');
    }

    const appointmentDate = new Date(date);

    if (
      Number.isNaN(appointmentDate.getTime()) ||
      appointmentDate <= new Date()
    ) {
      throw new BadRequestException(
        'Debes seleccionar una fecha futura válida.',
      );
    }

    // Respetar la disponibilidad actual del sistema.
    const existingAppointment = await this.prismaService.appointment.findFirst({
      where: {
        date: appointmentDate,
        status: 'activa',
      },
    });

    if (existingAppointment) {
      throw new BadRequestException('El horario seleccionado ya está ocupado.');
    }

    // Crear la cita asociando al paciente y fisioterapeuta.
    const appointment = await this.prismaService.appointment.create({
      data: {
        date: appointmentDate,
        reason,
        status: 'activa',
        patients: {
          create: {
            patient: {
              connect: { id: patientId },
            },
          },
        },
        doctors: {
          create: {
            doctor: {
              connect: { id: doctorId },
            },
          },
        },
      },
    });

    // Guardar aviso y solicitar su envío push al paciente.
    // Un fallo de notificación no cancela la cita.
    try {
      await this.pushNotificationsService.sendNotification({
        userId: patientId,
        type: 'APPOINTMENT_ASSIGNED',
        title: 'Nueva cita programada',
        body: `Tu fisioterapeuta te programó una cita para el ${appointmentDate.toLocaleString(
          'es-MX',
          { timeZone: 'America/Mexico_City' },
        )}.`,
        referenceId: appointment.id,
      });
    } catch (error) {
      this.logger.error(
        'La cita se creó, pero falló la notificación al paciente.',
        error instanceof Error ? error.stack : String(error),
      );
    }

    return appointment;
  }
}
