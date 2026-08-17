import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('MedicalRecord System (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1 Debe rechazar la creación de expedientes a peticiones sin token (401 Unauthorized)', () => {
    return request(app.getHttpServer())
      .post('/medical-records')
      .send({
        patientId: 'p-100',
        diagnosis: 'Sin autenticación',
      })
      .expect(401);
  });

  it('2 Debe rechazar la modificación de expedientes a peticiones sin token (401 Unauthorized)', () => {
    return request(app.getHttpServer())
      .patch('/medical-records/mr-100')
      .send({
        diagnosis: 'Sin autenticación',
      })
      .expect(401);
  });
});