import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { AppointmentsService } from '../../src/modules/appointments/appointments.service';
// 1. Importamos el servicio del cron
import { AppointmentsCronService } from '../../src/modules/appointments/cron/appointments-cron.service'; 

describe('Appointments Module - Create (e2e)', () => {
  let app: INestApplication<App>;
  let patientToken: string;

  const mockAppointmentsService = {
    create: jest.fn(),
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

    // Obtenee un token válido con rol de 'Paciente' antes de las pruebas
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
  it('/appointments (POST) - Debe crear una cita exitosamente', () => {
    const expectedResponse = {
      id: 'mock-id-123',
      date: '2026-11-01T10:00:00.000Z',
      reason: 'Revisión dental de rutina E2E',
      status: 'activa',
    };
    mockAppointmentsService.create.mockResolvedValue(expectedResponse);

    return request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        date: '2026-11-01T10:00:00Z',
        reason: 'Revisión dental de rutina E2E',
      })
      .expect(201)
      .then(({ body }) => {
        expect(body).toHaveProperty('id');
        expect(body.status).toEqual('activa');
      });
  });

  // --- FLUJO ANORMAL 1: Conflicto de horario ---
  it('/appointments (POST) - Debe fallar si el horario ya está ocupado', () => {
    const errorMessage = 'El horario seleccionado ya no está disponible.';
    mockAppointmentsService.create.mockRejectedValue({
      status: 400,
      response: { message: errorMessage },
    });

    return request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        date: '2026-11-01T10:00:00Z',
        reason: 'Intento de cita empalmada',
      })
      .catch((err) => {
        expect(err.status).toBe(400);
        expect(err.response.body.message).toContain(errorMessage);
      });
  });

  // --- FLUJO ANORMAL 2: Sin Autenticación ---
  it('/appointments (POST) - Debe rechazar la petición sin token', () => {
    return request(app.getHttpServer())
      .post('/appointments')
      .send({
        date: '2026-12-01T10:00:00Z',
        reason: 'Cita fantasma',
      })
      .expect(401);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});