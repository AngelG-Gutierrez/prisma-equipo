import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('create-medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordService) {}

  @Get('patient/:id')
  @UseGuards(JwtAuthGuard)
  async getPatientForRecord(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    if (user.role !== 'Administrador') {
      throw new UnauthorizedException('Solo los administradores pueden consultar pacientes para expedientes.');
    }
    return this.medicalRecordsService.findPatientById(id);
  }

  // Ticket 1: creación de expediente
  @Post()
  @UseGuards(JwtAuthGuard) // El guard de tu equipo valida que esté logueado
  async create(@Body() createDto: CreateMedicalRecordDto, @Req() req: any) {
    
    // el JwtAuthGuard guarda al usuario logueado en req.user
    const user = req.user; 

    // esta es la sentencia de validación de rol de un usuario
    if (user.role !== 'Administrador') {
      throw new UnauthorizedException('Solo los administradores pueden crear expedientes clínicos.');
    }

    return this.medicalRecordsService.create(createDto);
  }

  // Ticket 2: edición de expediente
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string, 
    @Body() updateDto: UpdateMedicalRecordDto, 
    @Req() req: any
  ) {
    const user = req.user;

    // Validamos el rol directamente desde el token igual que en el Ticket 1
    if (user.role !== 'Administrador') {
      throw new UnauthorizedException('Solo los administradores pueden editar expedientes clínicos.');
    }

    return this.medicalRecordsService.update(id, updateDto);
  }
}