import { ApiProperty } from '@nestjs/swagger';

export class MedicalRecordEntity {
  @ApiProperty({ description: 'ID único del expediente médico', example: '001' })
  id: string;

  @ApiProperty({ description: 'ID del paciente asociado', example: '123' })
  patientId: string;

  @ApiProperty({ description: 'Diagnóstico médico', example: 'Tos y gripa' })
  diagnosis: string;

  @ApiProperty({ description: 'Historial clínico', example: 'Inició con fiebre' })
  history: string;

  @ApiProperty({ description: 'Evolución médica', example: 'DIsminución de síntomas' })
  evolution: string;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt: Date;
}