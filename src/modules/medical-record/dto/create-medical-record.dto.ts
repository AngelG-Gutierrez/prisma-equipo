/*import { ApiProperty } from "@nestjs/swagger";

export class CreateMedicalRecordDto {
  @ApiProperty({ description: 'ID del paciente' })
  name: string;
}*/

export class CreateMedicalRecordDto {
  patientId: string;
  diagnosis: string;
  history: string;
  evolution: string;
}