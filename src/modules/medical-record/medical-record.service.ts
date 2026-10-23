import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/databases/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Injectable()
export class MedicalRecordService {
  verifyAdminRole(userId: any) {
    throw new Error('Method not implemented.');
  }
  constructor(private readonly prismaService: PrismaService) {}

  // Tickety 1: El administrador puede crear un expediente clínico
  async create(createMedicalRecordDto: CreateMedicalRecordDto) {
    return this.prismaService.medicalRecord.create({
      data: {
        patientId: createMedicalRecordDto.patientId,
        diagnosis: createMedicalRecordDto.diagnosis,
        history: createMedicalRecordDto.history,
        evolution: createMedicalRecordDto.evolution,
      },
    });
  }

  // Ticket 2: El administrador puede editar un expediente clínico
  async update(id: string, updateDto: any) {
    return this.prismaService.medicalRecord.update({
      where: { id },
      data: updateDto,
    });
  }
}