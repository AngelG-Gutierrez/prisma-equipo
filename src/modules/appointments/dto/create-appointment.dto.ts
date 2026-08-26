import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
  // Recibe la fecha y hora combinadas
  @ApiProperty({ required: true, description: "Fecha de la cita"})
  @IsNotEmpty({ message: 'La fecha de la cita es obligatoria.' })
  @IsDateString({}, { message: 'El formato de la fecha no es válido.' })
  date: string; 

  @ApiProperty({ required: true, description: "Motivo de la cita"})
  @IsOptional()
  @IsString({ message: 'El motivo debe ser una cadena de texto.' })
  reason?: string;

  /*@ApiProperty({
      enum: ProjectStatus,
      enumName: "status",
      description: "Estatus del proyecto"
    }) */
}