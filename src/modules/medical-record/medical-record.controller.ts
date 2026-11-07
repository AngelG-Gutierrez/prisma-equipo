import { Controller, Get, Post, Body, Param, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('create-medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordService) {}

  // Buscar paciente por ID para autocompletar el formulario en el frontend
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
  @UseGuards(JwtAuthGuard) 
  async create(@Body() createDto: CreateMedicalRecordDto, @Req() req: any) {
    const user = req.user; 

    if (user.role !== 'Administrador') {
      throw new UnauthorizedException('Solo los administradores pueden crear expedientes clínicos.');
    }

    return this.medicalRecordsService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: any) {
    const user = req.user;

    if (user.role !== 'Administrador') {
      throw new UnauthorizedException(
        'Solo los administradores pueden consultar lo   ... esta bien?s expedientes clínicos.',
      );
    }

    return this.medicalRecordsService.findAll();
  }

  // Obtener un expediente clínico individual por ID
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() req: any) {
    const user = req.user;

    if (user.role !== 'Administrador') {
      throw new UnauthorizedException(
        'Solo los administradores pueden consultar los expedientes clínicos.',
      );
    }

    return this.medicalRecordsService.findOne(id);
  }  
  
}