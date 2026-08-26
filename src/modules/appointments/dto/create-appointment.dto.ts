import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateAppointmentDto {
<<<<<<< HEAD
  // Recibe la fecha y hora combinadas
  @ApiProperty({ required: true, description: "Fecha de la cita"})
=======
  @ApiProperty({required: true, description: 'Fecha y hora de la cita'})
>>>>>>> ccc5456b70603c683db94415f80c80490c9c99e2
  @IsNotEmpty({ message: 'La fecha de la cita es obligatoria.' })
  @IsDateString({}, { message: 'El formato de la fecha no es válido.' })
  date: string; 

<<<<<<< HEAD
  @ApiProperty({ required: true, description: "Motivo de la cita"})
  @IsOptional()
  @IsString({ message: 'El motivo debe ser una cadena de texto.' })
  reason?: string;

  /*@ApiProperty({
      enum: ProjectStatus,
      enumName: "status",
      description: "Estatus del proyecto"
    }) */
=======
  @ApiProperty({required: true, description: 'Motivo de la cita'})
  @IsOptional()
  @IsString({ message: 'El motivo debe ser una cadena de texto.' })
  reason: string;
>>>>>>> ccc5456b70603c683db94415f80c80490c9c99e2
}