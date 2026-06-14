import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './helpers/create-test-app';
import { resetTestData, testPassword, uniqueEmail } from './helpers/test-data';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await resetTestData(app);
  });

  afterEach(async () => {
    await app.close();
  });

  it('signs up a user and omits the password from the response', async () => {
    const email = uniqueEmail('signup');

    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: testPassword, name: 'New User' })
      .expect(201);

    expect(response.body).toMatchObject({
      email,
      name: 'New User',
    });
    expect(response.body).not.toHaveProperty('password');
  });

  it('rejects duplicate emails with 409', async () => {
    const email = uniqueEmail('duplicate');

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: testPassword })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: testPassword })
      .expect(409);

    expect(response.body.message).toContain('email');
  });

  it('rejects invalid signup payloads with 400', async () => {
    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'not-an-email', password: 'short' })
      .expect(400);
  });

  it('logs in, returns the current user, and logs out', async () => {
    const email = uniqueEmail('login');
    const agent = request.agent(app.getHttpServer());

    const signup = await agent
      .post('/auth/signup')
      .send({ email, password: testPassword, name: 'Login User' })
      .expect(201);

    await agent
      .post('/auth/login')
      .send({ email, password: testPassword })
      .expect(200);

    const me = await agent.get('/auth/me').expect(200);
    expect(me.body).toMatchObject({
      id: signup.body.id,
      email,
      name: 'Login User',
    });

    await agent.post('/auth/logout').expect(200);
    await agent.get('/auth/me').expect(401);
  });

  it('returns 401 for invalid login credentials', async () => {
    const email = uniqueEmail('invalid-login');

    await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password: testPassword })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'WrongPassword1' })
      .expect(401);
  });

  it('returns 401 for /auth/me without a session cookie', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });
});
