import { Module } from '@nestjs/common';
import { MedicalRecordService } from './medical-record.service';
import { MedicalRecordsController } from './medical-record.controller';
import { PrismaService } from 'src/core/databases/prisma.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Historial Médico')

@Module({
  providers: [MedicalRecordService, PrismaService],
  controllers: [MedicalRecordsController]
})

export class MedicalRecordModule {}
