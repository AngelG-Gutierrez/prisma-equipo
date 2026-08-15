import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Sinergia App - Módulo Auth (Prueba E2E)', () => {
  let app: INestApplication;
  let jwtToken: string;

  // Aumentamos el tiempo límite por si la BD o Prisma tardan en responder
  jest.setTimeout(30000);

  // Credenciales de prueba
  const credencialesPrueba = {
    username: 'admin_sinergia',
    password: 'AdminSeguro123!',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // 1. Prueba de Autenticación
  it('POST /auth/login -> Debe autenticar al usuario y generar el access_token', async () => {
    const respuesta = await request(app.getHttpServer())
      .post('/auth/login')
      .send(credencialesPrueba)
      .expect(200);

    expect(respuesta.body).toHaveProperty('access_token');
    expect(respuesta.body.user).toBeDefined();

    // Guardamos el JWT para usarlo en la prueba de endpoint protegido
    jwtToken = respuesta.body.access_token;
  });

  // 2. Control de Acceso: Petición sin Token (Debe Rechazar)
  it('GET /auth/test-seguridad -> Debe denegar el acceso (401 Unauthorized) si no lleva token JWT', () => {
    return request(app.getHttpServer())
      .get('/auth/test-seguridad')
      .expect(401);
  });

  // 3. Control de Acceso: Petición con Token Válido (Debe Permitir)
  it('GET /auth/test-seguridad -> Debe permitir el acceso (200 OK) con token de autorización válido', async () => {
    const respuesta = await request(app.getHttpServer())
      .get('/auth/test-seguridad')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200);

    expect(respuesta.body.mensaje).toContain('SINERGIA APP');
  });

  afterAll(async () => {
    // Cerramos la aplicación NestJS al finalizar el ciclo de pruebas
    await app.close();
  });
});