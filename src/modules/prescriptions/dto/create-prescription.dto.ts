import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreatePrescriptionDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  exerciseName: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  frequency: string;

  @IsOptional()
  @IsUrl()
  mediaUrl?: string;
}