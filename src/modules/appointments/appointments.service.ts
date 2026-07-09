import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { PrismaService } from 'src/core/databases/prisma.service';

@Injectable()
export class AppointmentsService {
    constructor(private prismaService: PrismaService) {}
    async create(patientId: string, dto: CreateAppointmentDto) {
        const appointmentDate = new Date(dto.date);
        const now = new Date();

        if (appointmentDate < now) {
            throw new BadRequestException(
            'No se pueden agendar citas en fechas o en horarios pasados.',
            );
        }   
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

    //Crear la cita y la relación en la tabla intermedia
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

  async findAll() {
    return this.prismaService.appointment.findMany();
  }

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
