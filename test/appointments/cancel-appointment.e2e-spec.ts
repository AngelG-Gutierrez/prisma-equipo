import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { AppointmentsService } from '../../src/modules/appointments/appointments.service';
import { AppointmentsCronService } from '../../src/modules/appointments/cron/appointments-cron.service';

describe('Appointments Module - Cancel (e2e)', () => {
  let app: INestApplication<App>;
  let patientToken: string;

  const mockAppointmentsService = {
    cancel: jest.fn(),
  };

  const mockAppointmentsCronService = {
    handleAppointmentReminders: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AppointmentsService)
      .useValue(mockAppointmentsService)
      .overrideProvider(AppointmentsCronService)
      .useValue(mockAppointmentsCronService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Inicio de sesión para obtener token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: process.env.TEST_PATIENT_USER,
        password: process.env.TEST_PATIENT_PWD,
      });

    patientToken = loginRes.body.access_token;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- FLUJO NORMAL ---
  it('/appointments/:id/cancel (PATCH) - Debe cancelar una cita exitosamente', () => {
    const appointmentId = 'cita-valida-123';
    const expectedResponse = {
      id: appointmentId,
      status: 'cancelada',
    };
    
    mockAppointmentsService.cancel.mockResolvedValue(expectedResponse);

    return request(app.getHttpServer())
      .patch(`/appointments/${appointmentId}/cancel`)
      .set('Authorization', `Bearer ${patientToken}`) // Aplicar permisos
      .expect(200)
      .then(({ body }) => {
        expect(body.id).toEqual(appointmentId);
        expect(body.status).toEqual('cancelada');
      });
  });

  // --- FLUJO ANORMAL 1: Menos de 24 horas ---
  it('/appointments/:id/cancel (PATCH) - Debe fallar si falta menos de 24 hrs', () => {
    const appointmentId = 'cita-tarde-123';
    const errorMessage = 'Las citas solo pueden cancelarse con al menos 24 horas de anticipación.';
    
    mockAppointmentsService.cancel.mockRejectedValue({
      status: 400,
      response: { message: errorMessage },
    });

    return request(app.getHttpServer())
      .patch(`/appointments/${appointmentId}/cancel`)
      .set('Authorization', `Bearer ${patientToken}`)
      .catch((err) => {
        expect(err.status).toBe(400);
        expect(err.response.body.message).toContain(errorMessage);
      });
  });

  // --- FLUJO ANORMAL 2: Sin Autenticación ---
  it('/appointments/:id/cancel (PATCH) - Debe rechazar la petición sin token', () => {
    return request(app.getHttpServer())
      .patch('/appointments/cita-cualquiera/cancel')
      // Omitir el token intencionalmente
      .expect(401); // Verificamos la protección de rutas
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});