import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/databases/prisma.service';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prismaService: PrismaService) {}
  async findByPatient(patientId: string) {
    return this.prismaService.prescription.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
