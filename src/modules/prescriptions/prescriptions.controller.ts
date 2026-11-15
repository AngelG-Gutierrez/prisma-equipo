
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';

import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';

import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(
    private readonly prescriptionsService: PrescriptionsService,
  ) {}

  // Crear una prescripción
  @Roles('Administrador')
  @Post()
  async create(@Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(dto);
  }

  // Consultar prescripciones del paciente autenticado
  @Roles('Paciente')
  @Get('single')
  async getMyPrescriptions(@Req() req) {
    const userId = req.user.userId;
    return this.prescriptionsService.findByPatient(userId);
  }

  // Consultar pacientes que tienen ejercicios asignados
  @Roles('Administrador')
  @Get('admin')
  async getPatientsWithPrescriptions() {
    return this.prescriptionsService.findPatientsWithPrescriptions();
  }

  // Consultar todas las prescripciones de un paciente
  @Roles('Administrador')
  @Get('admin/patients/:id')
  async getPatientPrescriptions(@Param('id') id: string) {
    return this.prescriptionsService.findByPatient(id);
  }

  // Consultar el detalle de una prescripción
  @Roles('Administrador', 'Paciente')
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.prescriptionsService.findOne(id, req.user);
  }

  // Editar una prescripción
  @Roles('Administrador')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionsService.update(id, dto);
  }

  // Eliminar una prescripción
  @Roles('Administrador')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(id);
  }
}
