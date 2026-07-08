import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Paciente') // Bloquea el acceso a Administradores o usuarios sin sesión
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Req() req, @Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(
      req.user.userId,
      createAppointmentDto,
    );
  }

  @Patch(':id/cancel')
  cancel(@Req() req, @Param('id') appointmentId: string) {
    return this.appointmentsService.cancel(req.user.userId, appointmentId);
  }

  @Get()
  @Roles('Administrador')
  async findAll(@Req() req: any) {
    const user = req.user;

    if (user.role !== 'Administrador') {
      throw new UnauthorizedException(
        'Solo los administradores pueden visualizar todas las citas.',
      );
    }

    return this.appointmentsService.findAll();
  }
}
