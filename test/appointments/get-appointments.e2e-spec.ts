import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { AppointmentsService } from '../../src/modules/appointments/appointments.service';
import { AppointmentsCronService } from '../../src/modules/appointments/cron/appointments-cron.service';

describe('Appointments Module - Get (e2e)', () => {
  let app: INestApplication<App>;
  let patientToken: string;
  let adminToken: string;

  const mockAppointmentsService = {
    findAll: jest.fn(),
    findUpcomingByPatient: jest.fn(),
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

    //Obtener un token con rol de 'Paciente'
    const loginPatient = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: process.env.TEST_PATIENT_USER,
        password: process.env.TEST_PATIENT_PWD,
      });
    patientToken = loginPatient.body.access_token;

    //Obtener un token con rol de 'Administrador'
    const loginAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: process.env.TEST_ADMIN_USER,
        password: process.env.TEST_ADMIN_PWD,
      });
    adminToken = loginAdmin.body.access_token;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- FLUJO NORMAL 1: Próximas citas (Paciente) ---
  it('/appointments/upcoming (GET) - Debe retornar las citas del paciente', () => {
    const expectedResponse = [{ id: 'cita-1', status: 'activa' }];
    mockAppointmentsService.findUpcomingByPatient.mockResolvedValue(expectedResponse);

    return request(app.getHttpServer())
      .get('/appointments/upcoming')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body)).toBe(true);
        expect(body[0].id).toEqual('cita-1');
      });
  });

  // --- FLUJO NORMAL 2: Todas las citas (Admin) ---
  it('/appointments (GET) - Debe retornar todas las citas al administrador', () => {
    const expectedResponse = [{ id: 'cita-1' }, { id: 'cita-2' }];
    mockAppointmentsService.findAll.mockResolvedValue(expectedResponse);

    return request(app.getHttpServer())
      .get('/appointments')
      .set('Authorization', `Bearer ${adminToken}`) // Autenticación como admin
      .expect(200)
      .then(({ body }) => {
        expect(body.length).toBe(2);
      });
  });

  // --- FLUJO ANORMAL: Permisos insuficientes (Control de Roles) ---
  it('/appointments (GET) - Debe rechazar (403) si un paciente intenta ver todas las citas', () => {
    return request(app.getHttpServer())
      .get('/appointments')
      .set('Authorization', `Bearer ${patientToken}`) // Enviamos token de paciente a ruta de admin
      .expect(403); // Forbidden - Verificamos permisos del módulo
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});