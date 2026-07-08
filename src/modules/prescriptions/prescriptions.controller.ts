import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) { }

  @UseGuards(JwtAuthGuard)
  @Get('single')
  async getMyPrescriptions(@Req() req) {
    const userId = req.user.userId; 
    return this.prescriptionsService.findByPatient(userId);
  }
}
