import {
  IsString,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class UpdatePrescriptionDto {
  @IsOptional()
  @IsString()
  exerciseName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  frequency?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  equipment?: string;

  @IsOptional()
  @IsUrl()
  mediaUrl?: string;
}
