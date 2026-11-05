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

  async findAll() {
    const records = await this.prismaService.medicalRecord.findMany({
      include: {
        patient: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map((record, index) => ({
      id: record.id,
      number: `#${String(index + 1).padStart(3, '0')}`, // genera un formato consecutivo para el id
      patientName: record.patient?.name || 'Paciente sin nombre',
      date: new Date(record.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      //status: 'Completada', //temporal mientras veo como agregar el estatus a la bd
      diagnosis: record.diagnosis,
      history: record.history,
      evolution: record.evolution,
      patientId: record.patientId,
    }));
  }

  // obtener un expediente individual por su id 
  async findOne(id: string) {
    const record = await this.prismaService.medicalRecord.findUnique({
      where: { id },
      include: { patient: true },
    });

    if (!record) {
      throw new NotFoundException('Expediente médico no encontrado');
    }

    return record;
  }
}

