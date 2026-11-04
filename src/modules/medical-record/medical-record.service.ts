import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/databases/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Injectable()
export class MedicalRecordService {
  
  constructor(private readonly prismaService: PrismaService) {}

  // busqueda de paciente por el id
  async findPatientById(id: string) {
    const patient = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException('No se encontró ningún paciente con ese ID');
    }

    const age = patient.birthDate 
      ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear() 
      : 0;

    return {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      age: age.toString(),
    };
  }

  // Creación del expediente
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