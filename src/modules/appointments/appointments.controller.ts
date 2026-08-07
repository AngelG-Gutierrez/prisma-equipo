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
import { AppointmentsCronService } from './cron/appointments-cron.service';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly appointmentsCronService: AppointmentsCronService,
  ) { }

  @Post()
  @Roles('Paciente')
  create(@Req() req, @Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(
      req.user.userId,
      createAppointmentDto,
    );
  }

  @Patch(':id/cancel')
  @Roles('Paciente')
  cancel(@Req() req, @Param('id') appointmentId: string) {
    return this.appointmentsService.cancel(req.user.userId, appointmentId);
  }

  @Get()
  @Roles('Administrador')
  async findAll(@Req() req: any) {
    const user = req.user;
    return this.appointmentsService.findAll();
  }

  @Get('upcoming')
  async findUpcoming(@Req() req) {
    return this.appointmentsService.findUpcomingByPatient(req.user.userId);
  }

  // =========================================================
  // ENDPOINT MANUAL DE PRUEBA PARA EL CRON JOB (Notificaciones)
  // =========================================================
  @Post('trigger-reminders')
  @Roles('Administrador') // Restringido para que solo un admin pueda forzar el escaneo
  @HttpCode(HttpStatus.OK)
  async triggerCronManually() {
    this.appointmentsCronService.handleAppointmentReminders();
    
    return {
      statusCode: HttpStatus.OK,
      message: 'Escaneo de recordatorios iniciado en segundo plano. Revisa la consola de NestJS.',
    };
  }
}
