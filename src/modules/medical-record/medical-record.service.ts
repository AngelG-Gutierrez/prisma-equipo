import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/core/databases/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Injectable()
export class MedicalRecordService {
  constructor(private readonly prismaService: PrismaService) {}

  // Búsqueda del paciente por ID
  async findPatientById(id: string) {
    const patient = await this.prismaService.user.findUnique({
      where: { id },
      include: {
      medicalRecord: {
        select: {
          id: true,
        },
      },
    },
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
      hasMedicalRecord: !!patient.medicalRecord,
    };
  }

  // Obtener todos los expedientes clínicos  
  async findAll() {
    return this.prismaService.medicalRecord.findMany({
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            birthDate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Obtener un expediente clínico individual por ID
  async findOne(id: string) {
    const record = await this.prismaService.medicalRecord.findUnique({
      where: {
        id,
      },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            birthDate: true,
          },
        },
      },
    });

    if (!record) {
      throw new NotFoundException(
        'No se encontró el expediente médico solicitado.',
      );
    }

    return record;
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
  
  // Actualizar un expediente clínico
  async update(id: string, updateDto: UpdateMedicalRecordDto) {
    const existingRecord = await this.prismaService.medicalRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      throw new NotFoundException(
        'No se encontró el expediente médico que deseas actualizar.',
      );
    }

    return this.prismaService.medicalRecord.update({
      where: { id },
      data: updateDto,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            birthDate: true,
          },
        },
      },
    });
  }

  // Eliminar un expediente clínico
  async remove(id: string) {
    const existingRecord = await this.prismaService.medicalRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      throw new NotFoundException(
        'No se encontró el expediente médico que deseas eliminar.',
      );
    }

    await this.prismaService.medicalRecord.delete({
      where: { id },
    });

    return {
      message: 'El expediente médico se eliminó correctamente.',
    };
  }
}