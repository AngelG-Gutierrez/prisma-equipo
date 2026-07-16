import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { MedicalRecordModule } from './modules/medical-record/medical-record.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrescriptionsModule,
    AppointmentsModule,
    MedicalRecordModule,
    NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService,{
    provide: 'APP_GUARD',
    useClass: JwtAuthGuard,
  }],
})
export class AppModule {}
