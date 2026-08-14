import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Acceder al perfil de usuario (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/POST auth/login', async () => {
    const userTest = {
      username: process.env.TEST_PATIENT_USER,
      password: process.env.TEST_PATIENT_PWD
    };

    return request(app.getHttpServer())
      .post('/auth/login')
      .send(userTest)
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toBeDefined();
        expect(body.user.username).toEqual(userTest.username);
        expect(body.access_token).toBeDefined();
        process.env.TOKEN = body.access_token;
      });
  });

  it('/GET auth/profile (Sin Token)', () => {
    return request(app.getHttpServer())
      .get('/auth/profile')
      .expect(401);
  });

  it('/GET auth/profile (Con Token)', async () => {
    const expectedUsername = process.env.TEST_USER;

    return request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${process.env.TOKEN}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.username).toEqual(expectedUsername);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});