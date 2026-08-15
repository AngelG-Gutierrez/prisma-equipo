import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppointmentsModule } from '../src/modules/appointments/appointments.module';
import { AppointmentsService } from '../src/modules/appointments/appointments.service';
import { RolesGuard } from '../src/core/guards/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

describe('AppointmentsController (e2e)', () => {
  let app: INestApplication;

  const mockAppointmentsService = {
    create: jest.fn(),
    cancel: jest.fn(),
    findAll: jest.fn(),
    findUpcomingByPatient: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppointmentsModule],
    })
      .overrideProvider(AppointmentsService)
      .useValue(mockAppointmentsService)
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { userId: 'patient-123', role: 'Paciente' };
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /appointments', () => {
    it('debe responder 400 si la fecha no es un DateString válido', () => {
      return request(app.getHttpServer())
        .post('/appointments')
        .send({ date: 'invalid-date', reason: 'Dolor de muela' })
        .expect(400);
    });

    it('debe responder 210/201 al crear la cita exitosamente', () => {
      const validDate = new Date(Date.now() + 86400000).toISOString();
      mockAppointmentsService.create.mockResolvedValue({
        id: 'app-999',
        date: validDate,
        status: 'activa',
      });

      return request(app.getHttpServer())
        .post('/appointments')
        .send({ date: validDate, reason: 'Revision general' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', 'app-999');
        });
    });
  });

  describe('PATCH /appointments/:id/cancel', () => {
    it('debe retornar 200 al cancelar la cita exitosamente', () => {
      mockAppointmentsService.cancel.mockResolvedValue({
        id: 'app-999',
        status: 'cancelada',
      });

      return request(app.getHttpServer())
        .patch('/appointments/app-999/cancel')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('cancelada');
        });
    });
  });

  describe('GET /appointments/upcoming', () => {
    it('debe retornar un arreglo con las próximas citas del paciente', () => {
      mockAppointmentsService.findUpcomingByPatient.mockResolvedValue([
        { id: 'app-1', status: 'activa' },
      ]);

      return request(app.getHttpServer())
        .get('/appointments/upcoming')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(1);
        });
    });
  });
});