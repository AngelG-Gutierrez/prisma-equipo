import { ApiProperty } from '@nestjs/swagger';

export class Appointment {
  @ApiProperty({
    description: 'Identificador único de la cita',
    example: 'cmsi98ral0003bfqnf3s681bh',
  }) 
  id: string;

  @ApiProperty({
    required: true, 
    description: 'Fecha y hora de la cita',
    example: '2026-08-07T10:00:00.000Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Estado actual de la cita',
    example: 'activa',
    default: 'activa',
  })
  status: string;

  @ApiProperty({
    required: true, 
    description: 'Motivo de la cita',
    example: 'Consulta de valoración médica y seguimiento de rutina',
  })
  reason: string;

  @ApiProperty({
    description: 'Indica si ya se envió el recordatorio de la cita',
    example: false,
    default: false,
  })
  reminderSent: boolean;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2026-08-07T01:17:11.853Z',
  })
  createdAt: Date;
}