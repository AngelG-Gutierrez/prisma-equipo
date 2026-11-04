import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({required: true, description: 'Fecha y hora de la cita'})
  @IsNotEmpty({ message: 'La fecha de la cita es obligatoria.' })
  @IsDateString({}, { message: 'El formato de la fecha no es válido.' })
  date: string; 

  @ApiProperty({required: true, description: 'Motivo de la cita'})
  @IsOptional()
  @IsString({ message: 'El motivo debe ser una cadena de texto.' })
  reason: string;
}