import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/databases/prisma.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';

@Injectable()
export class MedicalRecordService {
  /**
   * Verifics si el usuario cuenta con el rol de Administrador
   * @param userId Identificador único del usuario a evaluar
   */
  verifyAdminRole(userId: any) {
    throw new Error('Method not implemented.');
  }

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * crea y registra un nuevo expediente clínico en la base de datos mediante Prisma
   * @param createMedicalRecordDto Objeto con los datos del expediente (paciente, diagnóstico, historial y evolución).
   * @returns Registro del expediente clínico creado
   */
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

  /**
   * Actualiza la información de un expediente clínico existente mediante su ID
   * @param id Identificador único del expediente clínico a modificar
   * @param updateDto Objeto con los campos parciales a actualizar
   * @returns registro del expediente clínico actualizado
   */
  async update(id: string, updateDto: UpdateMedicalRecordDto) {
    return this.prismaService.medicalRecord.update({
      where: { id },
      data: updateDto,
    });
  }
}