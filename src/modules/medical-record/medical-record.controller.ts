import { Controller, Post, Body, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordService) {}

  // Ticket 1: Crear expediente
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createDto: CreateMedicalRecordDto, @Req() req: any) {
    const user = req.user; 

    //No cree guards nuevos para ver el rol del usuario, por lo que lo hago con esta sentencia
    if (user.role !== 'Administrador') {
      throw new UnauthorizedException('Solo los administradores pueden crear expedientes clínicos.');
    }

    return this.medicalRecordsService.create(createDto);
  }
}