import { Controller, Post, Patch, Body, Param, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordService) {}

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