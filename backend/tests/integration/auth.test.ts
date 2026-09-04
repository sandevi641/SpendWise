import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';

const app = createApp();

describe('Auth Integration API', () => {
  const testUser = {
    email: `test_auth_${Date.now()}@spendwise.com`,
    password: 'SecurePassword123!',
    firstName: 'Test',
    lastName: 'Engineer',
    currency: 'USD',
  };

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'test_auth_' } },
    });
    await prisma.$disconnect();
  });

  it('should successfully register a new user and return JWT token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  it('should reject registration if email is already registered', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should successfully login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
