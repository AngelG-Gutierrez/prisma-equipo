import { IsNotEmpty, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  // Recibe la fecha y hora combinadas (formato ISO 8601)
  @IsNotEmpty({ message: 'La fecha de la cita es obligatoria.' })
  @IsDateString({}, { message: 'El formato de la fecha no es válido.' })
  date: string; 

  @IsOptional()
  @IsString({ message: 'El motivo debe ser una cadena de texto.' })
  reason?: string;
}