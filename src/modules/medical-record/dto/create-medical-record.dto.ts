import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMedicalRecordDto {

  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @IsString()
  @IsNotEmpty()
  history: string;

  @IsString()
  @IsNotEmpty()
  evolution: string;

}