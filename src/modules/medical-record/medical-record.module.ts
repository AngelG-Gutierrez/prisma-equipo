import { Module } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { MedicalRecordsController } from './medical-record.controller';

@Module({
  providers: [MedicalRecordService],
  controllers: [MedicalRecordsController]
})
export class MedicalRecordModule {}
