import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PrescriptionEntity {
  @ApiProperty({
    example: 'cm123abc456def',
    description: 'Identificador único de la prescripción',
  })
  id: string;

  @ApiProperty({
    example: 'cm123patient456',
    description: 'ID del paciente al que pertenece la prescripción',
  })
  patientId: string;

  @ApiProperty({
    example: 'Ejercicios de movilidad de hombro',
    description: 'Nombre del ejercicio asignado',
  })
  exerciseName: string;

  @ApiProperty({
    example:
      'Realizar movimientos circulares del hombro de forma lenta y controlada.',
    description: 'Descripción e instrucciones del ejercicio',
  })
  description: string;

  @ApiProperty({
    example: '3 series de 10 repeticiones, 2 veces al día',
    description: 'Frecuencia o repeticiones del ejercicio',
  })
  frequency: string;

  @ApiPropertyOptional({
    example: 'https://ejemplo.com/video-ejercicio.mp4',
    description: 'URL opcional de contenido multimedia',
  })
  mediaUrl?: string;

  @ApiProperty({
    example: '2026-08-20T12:00:00.000Z',
    description: 'Fecha de creación de la prescripción',
  })
  createdAt: Date;
}