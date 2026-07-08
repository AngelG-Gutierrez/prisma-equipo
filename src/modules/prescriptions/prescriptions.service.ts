import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/databases/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: CreatePrescriptionDto) {
    return this.prismaService.prescription.create({
      data: dto,
    });
  }

  async findByPatient(patientId: string) {
    return this.prismaService.prescription.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }
}