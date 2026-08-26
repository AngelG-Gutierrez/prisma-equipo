import { Controller, Post, Patch, Body, Param, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { MedicalRecordService } from './medical-record.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MedicalRecordEntity } from './entities/medical-record.entities';

@ApiTags('Historiales Médicos') // Agrupa este controlador en la UI de Swagger
@ApiBearerAuth() // Requiere token Bearer para probar los endpoints
@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordService) {}

  // Ticket 1: creación de expediente
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Creación de expediente clínico' }) // Descripción corta[cite: 1]
  @ApiBody({ type: CreateMedicalRecordDto }) // Esquema de cuerpo de petición[cite: 1]
  @ApiResponse({ status: 201, type: MedicalRecordEntity, description: 'Expediente clínico creado exitosamente.' }) // Respuesta exitosa[cite: 1]
  @ApiResponse({ status: 401, description: 'No autorizado / Solo administradores.' })
  async create(@Body() createDto: CreateMedicalRecordDto, @Req() req: any) {
    const user = req.user; 

    if (user.role !== 'Administrador') {
      throw new UnauthorizedException('Solo los administradores pueden crear expedientes clínicos.');
    }

    return this.medicalRecordsService.create(createDto);
  }

  // Ticket 2: edición de expediente
  @ApiOperation({summary: "Actualización de expediente"})
  @ApiParam({
    type: "string",
    name: "id",
    description: "Id de historial medico"
  })
  @ApiBody({
    description: "Datos del historial medico",
    type: UpdateMedicalRecordDto
  })
  @ApiResponse({ status: '2XX', type: UpdateMedicalRecordDto})
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Edición de expediente clínico' }) // Descripción corta[cite: 1]
  @ApiParam({ name: 'id', description: 'ID del expediente clínico a actualizar' }) // Documenta el parámetro de ruta[cite: 1]
  @ApiBody({ type: UpdateMedicalRecordDto }) // Esquema de cuerpo de actualización[cite: 1]
  @ApiResponse({ status: 200, type: MedicalRecordEntity, description: 'Expediente clínico actualizado exitosamente.' }) // Respuesta exitosa[cite: 1]
  @ApiResponse({ status: 401, description: 'No autorizado / Solo administradores.' })
  async update(
    @Param('id') id: string, 
    @Body() updateDto: UpdateMedicalRecordDto, 
    @Req() req: any
  ) {
    const user = req.user;

    if (user.role !== 'Administrador') {
      throw new UnauthorizedException('Solo los administradores pueden editar expedientes clínicos.');
    }

    return this.medicalRecordsService.update(id, updateDto);
  }
}