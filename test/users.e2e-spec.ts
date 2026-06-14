import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { createTestApp } from './helpers/create-test-app';
import { resetTestData, testPassword, uniqueEmail } from './helpers/test-data';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    app = await createTestApp();
    await resetTestData(app);
  });

  afterEach(async () => {
    await app.close();
  });

  /** Signs up and logs in, returning the authenticated supertest agent. */
  async function createAuthenticatedUser(label: string) {
    const email = uniqueEmail(label);
    const agent = request.agent(app.getHttpServer());

    const signup = await agent
      .post('/auth/signup')
      .send({ email, password: testPassword, name: `${label} User` })
      .expect(201);

    await agent
      .post('/auth/login')
      .send({ email, password: testPassword })
      .expect(200);

    return { agent, user: signup.body as { id: number; email: string; name: string } };
  }

  it('returns the authenticated user profile for their own id', async () => {
    const { agent, user } = await createAuthenticatedUser('profile');

    const response = await agent.get(`/users/${user.id}`).expect(200);

    expect(response.body).toMatchObject({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    expect(response.body).not.toHaveProperty('password');
  });

  it('forbids access to another user account', async () => {
    const owner = await createAuthenticatedUser('owner');
    const other = await createAuthenticatedUser('other');

    await owner.agent.get(`/users/${other.user.id}`).expect(403);
  });

  it('updates the profile and refreshes the Redis session', async () => {
    const { agent, user } = await createAuthenticatedUser('update');

    await agent
      .patch(`/users/${user.id}`)
      .send({ name: 'Updated Name' })
      .expect(200);

    const me = await agent.get('/auth/me').expect(200);
    expect(me.body.name).toBe('Updated Name');
  });

  it('deletes the authenticated account and clears the session', async () => {
    const { agent, user } = await createAuthenticatedUser('delete');

    await agent.delete(`/users/${user.id}`).expect(200);
    await agent.get('/auth/me').expect(401);
    await agent.get(`/users/${user.id}`).expect(401);
  });
});
