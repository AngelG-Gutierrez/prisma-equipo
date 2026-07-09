import { Module } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';
import { PrismaService } from 'src/core/databases/prisma.service';

@Module({
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService, PrismaService],
})
export class PrescriptionsModule {}
