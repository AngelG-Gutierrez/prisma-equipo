import { Module } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { MedicalRecordsController } from './medical-record.controller';
import { PrismaService } from 'src/core/databases/prisma.service';

@Module({
  providers: [MedicalRecordService, PrismaService],
  controllers: [MedicalRecordsController]
})
export class MedicalRecordModule {}
