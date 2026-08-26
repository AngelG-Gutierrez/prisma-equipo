import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags("Ejercicios")
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) { }

  @ApiOperation({summary: 'Agregar cita'})
  @ApiCreatedResponse({ type: CreateAppointmentDto})
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

  @ApiOperation({ summary: "Lista de citas"})
  @ApiResponse({ status: "2XX", type: CreateAppointmentDto, isArray: true})
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
}
