import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Ajusta la ruta según tu árbol de carpetas

@Controller('create-medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordService) {}

  // busqueda de paciente por el id para crear expediente
  @Get('patient/:id')
  @UseGuards(JwtAuthGuard)
  async getPatientForRecord(@Param('id') id: string, @Req() req: any) {
    const user = req.user;
    if (user.role !== 'Administrador') {
      throw new UnauthorizedException('Solo los administradores pueden consultar pacientes para expedientes.');
    }
    return this.medicalRecordsService.findPatientById(id);
  }

  // TICKET 1: Crear expediente
  @Post()
  @UseGuards(JwtAuthGuard) // El guard de tu equipo valida que esté logueado
  async create(@Body() createDto: CreateMedicalRecordDto, @Req() req: any) {
    // El JwtAuthGuard guarda al usuario logueado en req.user
    const user = req.user; 

    // Validamos si es Administrador (revisa si en tu DB es "Admin", "Administrador", etc.)
    if (user.role !== 'Administrador') {
      throw new UnauthorizedException('Solo los administradores pueden crear expedientes clínicos.');
    }

    return this.medicalRecordsService.create(createDto);
  }
}