import { ApiProperty } from "@nestjs/swagger";

export class Appointment {
  @ApiProperty() 
  id: string;
  @ApiProperty({required: true, description: 'Fecha y hora de la cita'})
  date: Date;
  status: string;
  @ApiProperty({required: true, description: 'Motivo de la cita'})
  reason: string;
  createdAt: Date
}