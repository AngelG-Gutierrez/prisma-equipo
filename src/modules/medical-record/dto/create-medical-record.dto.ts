import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateMedicalRecordDto {
  @ApiProperty({ description: 'ID del paciente', example: '123' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ description: 'Diagnóstico médico inicial', example: 'Tos y gripa' })
  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @ApiProperty({ description: 'Historial médico previo del paciente', example: 'Inició con fiebre' })
  @IsString()
  @IsNotEmpty()
  history: string;

  @ApiProperty({ description: 'Evolución del estado de salud del paciente', example: 'Disminución de síntomas' })
  @IsString()
  @IsNotEmpty()
  evolution: string;
}