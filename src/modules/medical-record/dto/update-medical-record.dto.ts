import { PartialType } from '@nestjs/swagger'; // Debe provenir de @nestjs/swagger
import { CreateMedicalRecordDto } from './create-medical-record.dto';

export class UpdateMedicalRecordDto extends PartialType(CreateMedicalRecordDto) {}