import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/core/databases/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Injectable()
export class MedicalRecordService {
  constructor(private readonly prismaService: PrismaService) {}

  // Búsqueda del paciente por ID (para autocompletar el front)
  async findPatientById(id: string) {
    const patient = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!patient) {
      throw new NotFoundException('No se encontró ningún paciente con ese ID');
    }

    const birthDate = new Date(patient.birthDate);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const hasNotHadBirthday =
      today.getMonth() < birthDate.getMonth() ||
      (
        today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate()
      );

    if (hasNotHadBirthday) {
      age--;
    }

    return {
      id: patient.id,
      name: patient.name,
      email: patient.email,
      age: age.toString(),
    };
  }

  // Creación del expediente
  async create(createMedicalRecordDto: CreateMedicalRecordDto) {
    const existingRecord = await this.prismaService.medicalRecord.findUnique({
      where: {
        patientId: createMedicalRecordDto.patientId,
      },
    });

    if (existingRecord) {
      throw new ConflictException(
        'Este paciente ya cuenta con un expediente clínico.',
      );
    }

    return this.prismaService.medicalRecord.create({
      data: {
        patientId: createMedicalRecordDto.patientId,
        diagnosis: createMedicalRecordDto.diagnosis,
        history: createMedicalRecordDto.history,
        evolution: createMedicalRecordDto.evolution,
      },
    });
  }
  update(id: string, updateDto: UpdateMedicalRecordDto) {
    throw new Error('Method not implemented.');
  }
}