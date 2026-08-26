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
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
<<<<<<< HEAD
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags("Ejercicios")
=======
import { AppointmentsCronService } from './cron/appointments-cron.service';
import { 
  ApiBearerAuth, 
  ApiCreatedResponse, 
  ApiOkResponse, 
  ApiOperation, 
  ApiParam, 
  ApiTags 
} from '@nestjs/swagger';
import { Appointment } from './appointment';

@ApiTags('Appointments')
@ApiBearerAuth()
>>>>>>> ccc5456b70603c683db94415f80c80490c9c99e2
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly appointmentsCronService: AppointmentsCronService,
  ) { }

<<<<<<< HEAD
  @ApiOperation({summary: 'Agregar cita'})
  @ApiCreatedResponse({ type: CreateAppointmentDto})
=======
  @ApiOperation({ summary: 'Crear una nueva cita' })
  @ApiCreatedResponse({ 
    type: Appointment, 
    description: 'La cita ha sido creada exitosamente.' 
  })
>>>>>>> ccc5456b70603c683db94415f80c80490c9c99e2
  @Post()
  @Roles('Paciente')
  create(@Req() req, @Body() createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    return this.appointmentsService.create(
      req.user.userId,
      createAppointmentDto,
    );
  }

  @ApiOperation({ summary: 'Cancelar una cita existente' })
  @ApiParam({ name: 'id', description: 'El ID (CUID) de la cita a cancelar' })
  @ApiOkResponse({ 
    schema: {
      example: {
        id: 'cmsi98ral0003bfqnf3s681bh',
        date: '2026-08-25T16:00:00.000Z',
        status: 'cancelada', // <--- Swagger ahora mostrará correctamente el estado cancelado
        reason: 'Valoración inicial de fisioterapia',
        reminderSent: false,
        createdAt: '2026-08-20T10:00:00.000Z'
      }
    },
    description: 'La cita ha sido cancelada exitosamente.' 
  })
  @Patch(':id/cancel')
  @Roles('Paciente')
  cancel(@Req() req, @Param('id') appointmentId: string): Promise<Appointment> {
    return this.appointmentsService.cancel(req.user.userId, appointmentId);
  }

<<<<<<< HEAD
  @ApiOperation({ summary: "Lista de citas"})
  @ApiResponse({ status: "2XX", type: CreateAppointmentDto, isArray: true})
=======
  @ApiOperation({ summary: 'Obtener todas las citas (Solo Administrador)' })
  @ApiOkResponse({ 
    type: [Appointment],
    description: 'Retorna la lista de todas las citas del sistema.' 
  })
>>>>>>> ccc5456b70603c683db94415f80c80490c9c99e2
  @Get()
  @Roles('Administrador')
  async findAll(@Req() req: any): Promise<Appointment[]> {
    const user = req.user;
    return this.appointmentsService.findAll();
  }

  @ApiOperation({ summary: 'Obtener las próximas citas del paciente autenticado' })
  @ApiOkResponse({ 
    type: [Appointment], 
    description: 'Retorna la lista de citas futuras para el paciente.' 
  })
  @Get('upcoming')
  async findUpcoming(@Req() req): Promise<Appointment[]> {
    return this.appointmentsService.findUpcomingByPatient(req.user.userId);
  }

  // =========================================================
  // ENDPOINT MANUAL DE PRUEBA PARA EL CRON JOB (Notificaciones)
  // =========================================================
  @ApiOperation({ summary: 'Disparar manualmente el job de notificaciones de citas (Solo Administrador)' })
  @ApiOkResponse({ 
    description: 'El proceso de envío de recordatorios se ha iniciado en segundo plano.',
    schema: {
      example: {
        statusCode: 200,
        message: 'Escaneo de recordatorios iniciado en segundo plano. Revisa la consola de NestJS.'
      }
    }
  })
  @Post('trigger-reminders')
  @Roles('Administrador')
  @HttpCode(HttpStatus.OK)
  async triggerCronManually() {
    this.appointmentsCronService.handleAppointmentReminders();
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Escaneo de recordatorios iniciado en segundo plano. Revisa la consola de NestJS.',
    };
  }
}