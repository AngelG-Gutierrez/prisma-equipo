import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { PrismaService } from 'src/core/databases/prisma.service';
import { Appointment } from './appointment';

@Injectable()
export class AppointmentsService {
  constructor(private prismaService: PrismaService) { }

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
   * Obtiene las próximas citas activas de un paciente en específico, ordenadas cronológicamente.
   * 
   * @param {string} patientId - El identificador del paciente.
   * @returns {Promise<Appointment[]>} Un arreglo con las futuras citas del paciente.
   */
  async findUpcomingByPatient(patientId: string) {
    const now = new Date();
    return this.prismaService.appointment.findMany({
      where: {
        date: { gte: now },
        status: 'activa',
        patients: {
          some: { patientId },
        },
      },
      orderBy: { date: 'asc' },
    });
  }
}