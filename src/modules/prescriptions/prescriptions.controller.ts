import { Controller, Get, Post, Body, UseGuards, Req, } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { PrescriptionEntity } from './entities/prescription.entity';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';

@ApiTags('Prescripciones')
@ApiBearerAuth()
@Controller('prescriptions')
@UseGuards(RolesGuard)
export class PrescriptionsController {
  constructor(
    private readonly prescriptionsService: PrescriptionsService,
  ) { }

  @Roles('Administrador')
  @Post()
  @ApiOperation({
    summary: 'Crear una nueva prescripción para un paciente',
  })
  @ApiResponse({
    status: 201,
    description: 'Prescripción creada correctamente',
    type: PrescriptionEntity,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT inválido o no proporcionado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Este endpoint requiere privilegios de Administrador',
  })
  async create(@Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(dto);
  }

  @Roles('Paciente')
  @Get('single')
  @ApiOperation({
    summary: 'Obtener las prescripciones del paciente autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de prescripciones del paciente',
    type: [PrescriptionEntity],
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado. Token JWT inválido o no proporcionado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado. Este endpoint requiere privilegios de Paciente',
  })
  async getMyPrescriptions(@Req() req) {
    const userId = req.user.userId;

    return this.prescriptionsService.findByPatient(userId);
  }
}