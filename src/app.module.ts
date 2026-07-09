import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { MedicalRecordModule } from './modules/medical-record/medical-record.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    AppointmentsModule,
    MedicalRecordModule
  ],
  controllers: [AppController],
  providers: [AppService,{
    provide: 'APP_GUARD',
    useClass: JwtAuthGuard,
  }],
})
export class AppModule {}
