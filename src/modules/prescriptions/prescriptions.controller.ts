import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { RolesGuard } from 'src/core/guards/roles.guard';      
import { Roles } from 'src/core/decorators/roles.decorator';    

@Controller('prescriptions')
@UseGuards(RolesGuard) 
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Roles('Administrador')
  @Post()
  async create(@Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(dto);
  }

  @Roles('Paciente')
  @Get('single')
  async getMyPrescriptions(@Req() req) {
    const userId = req.user.userId;
    return this.prescriptionsService.findByPatient(userId);
  }
}