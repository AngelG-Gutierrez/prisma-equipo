import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePrescriptionDto {
  @ApiProperty({
    example: 'cm123patient456',
    description: 'ID del paciente al que se le asignará la prescripción',
  })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({
    example: 'Ejercicios de movilidad de hombro',
    description: 'Nombre del ejercicio',
  })
  @IsString()
  @IsNotEmpty()
  exerciseName: string;

  @ApiProperty({
    example:
      'Realizar movimientos circulares del hombro lentamente durante 10 minutos.',
    description: 'Descripción del ejercicio',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '3 series de 10 repeticiones, 2 veces al día',
    description: 'Frecuencia o cantidad de repeticiones',
  })
  @IsString()
  @IsNotEmpty()
  frequency: string;

  @ApiPropertyOptional({
    example: 'https://ejemplo.com/ejercicio.mp4',
    description: 'URL opcional de un video o recurso multimedia',
  })
  @IsOptional()
  @IsUrl()
  mediaUrl?: string;
} 