import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';

import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { AppointmentsCronService } from './cron/appointments-cron.service';
import { Appointment } from './appointment';

// =========================================================
// DTO: ASIGNAR FISIOTERAPEUTA A UNA CITA EXISTENTE
// =========================================================

class AssignDoctorDto {
  @ApiProperty({
    description: 'ID del fisioterapeuta que atenderá la cita',
  })
  @IsString()
  @IsNotEmpty()
  doctorId!: string;
}

// =========================================================
// DTO: FISIOTERAPEUTA PROGRAMA UNA CITA PARA UN PACIENTE
// =========================================================

class CreateAppointmentByDoctorDto {
  @ApiProperty({
    description: 'ID del paciente que recibirá la cita',
  })
  @IsString()
  @IsNotEmpty()
  patientId!: string;

  @ApiProperty({
    example: '2026-11-10T16:00:00.000Z',
    description: 'Fecha y hora de la cita en formato ISO',
  })
  @IsDateString()
  date!: string;

  @ApiProperty({
    example: 'Sesión de fisioterapia',
    description: 'Motivo de la cita',
  })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

// =========================================================
// CONTROLADOR DE CITAS
// =========================================================

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly appointmentsCronService: AppointmentsCronService,
  ) { }

  // =========================================================
  // 1. ASIGNAR FISIOTERAPEUTA A UNA CITA EXISTENTE
  // =========================================================

  @ApiOperation({
    summary: 'Asignar un fisioterapeuta a una cita y generar su notificación',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador de la cita',
  })
  @ApiOkResponse({
    description: 'Fisioterapeuta asignado correctamente.',
  })
  @Patch(':id/assign-doctor')
  @Roles('Administrador')
  async assignDoctor(
    @Param('id') appointmentId: string,
    @Body() dto: AssignDoctorDto,
  ) {
    return this.appointmentsService.assignDoctor(appointmentId, dto.doctorId);
  }

  // =========================================================
  // 2. FISIOTERAPEUTA PROGRAMA UNA CITA PARA UN PACIENTE
  // =========================================================

  @ApiOperation({
    summary: 'Programar cita para un paciente y generar una notificación push',
  })
  @ApiCreatedResponse({
    type: Appointment,
    description: 'Cita programada correctamente para el paciente.',
  })
  @Post('assign-patient')
  @Roles('Administrador')
  async createByDoctor(
    @Req() req,
    @Body() dto: CreateAppointmentByDoctorDto,
  ): Promise<Appointment> {
    return this.appointmentsService.createByDoctor(
      req.user.userId,
      dto.patientId,
      dto.date,
      dto.reason,
    );
  }

  // =========================================================
  // 3. PACIENTE CREA UNA NUEVA CITA
  // =========================================================

  @ApiOperation({
    summary: 'Crear una nueva cita',
  })
  @ApiCreatedResponse({
    type: Appointment,
    description: 'La cita ha sido creada exitosamente.',
  })
  @Post()
  @Roles('Paciente')
  create(
    @Req() req,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentsService.create(
      req.user.userId,
      createAppointmentDto,
    );
  }

  // =========================================================
  // 4. CANCELAR UNA CITA EXISTENTE
  // =========================================================

  @ApiOperation({
    summary: 'Cancelar una cita existente',
  })
  @ApiParam({
    name: 'id',
    description: 'El ID (CUID) de la cita a cancelar',
  })
  @ApiOkResponse({
    schema: {
      example: {
        id: 'cmsi98ral0003bfqnf3s681bh',
        date: '2026-08-25T16:00:00.000Z',
        status: 'cancelada',
        reason: 'Valoración inicial de fisioterapia',
        reminderSent: false,
        createdAt: '2026-08-20T10:00:00.000Z',
      },
    },
    description: 'La cita ha sido cancelada exitosamente.',
  })
  @Patch(':id/cancel')
  @Roles('Paciente')
  cancel(@Req() req, @Param('id') appointmentId: string): Promise<Appointment> {
    return this.appointmentsService.cancel(req.user.userId, appointmentId);
  }

  // =========================================================
  // 5. OBTENER TODAS LAS CITAS
  // =========================================================

  @ApiOperation({
    summary: 'Obtener todas las citas',
  })
  @ApiOkResponse({
    type: [Appointment],
    description: 'Retorna la lista de citas del sistema.',
  })
  @Get()
  @Roles('Administrador', 'Paciente')
  findAll(): Promise<Appointment[]> {
    return this.appointmentsService.findAll();
  }

  // =========================================================
  // 6. OBTENER PRÓXIMAS CITAS DEL PACIENTE
  // =========================================================

  @ApiOperation({
    summary: 'Obtener las próximas citas del paciente autenticado',
  })
  @ApiOkResponse({
    type: [Appointment],
    description: 'Retorna la lista de citas futuras para el paciente.',
  })
  @Get('upcoming')
  async findUpcoming(@Req() req): Promise<Appointment[]> {
    return this.appointmentsService.findUpcomingByPatient(req.user.userId);
  }

  // =========================================================
  // 7. EJECUTAR MANUALMENTE RECORDATORIOS DE CITAS
  // =========================================================

  @ApiOperation({
    summary:
      'Disparar manualmente el job de notificaciones de citas (Solo Administrador)',
  })
  @ApiOkResponse({
    description:
      'El proceso de envío de recordatorios se ha iniciado en segundo plano.',
    schema: {
      example: {
        statusCode: 200,
        message:
          'Escaneo de recordatorios iniciado en segundo plano. Revisa la consola de NestJS.',
      },
    },
  })
  @Post('trigger-reminders')
  @Roles('Administrador')
  @HttpCode(HttpStatus.OK)
  async triggerCronManually() {
    this.appointmentsCronService.handleAppointmentReminders();

    return {
      statusCode: HttpStatus.OK,
      message:
        'Escaneo de recordatorios iniciado en segundo plano. Revisa la consola de NestJS.',
    };
  }
}
