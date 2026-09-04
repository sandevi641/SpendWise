import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';

const app = createApp();

describe('Transactions & Financial Calculations API', () => {
  let token: string;
  let userId: string;
  let accountId: string;
  let categoryId: string;

  beforeAll(async () => {
    const email = `tx_test_${Date.now()}@spendwise.com`;
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'Password123!',
        firstName: 'Tx',
        lastName: 'Tester',
      });

    token = regRes.body.data.token;
    userId = regRes.body.data.user.id;

    const accRes = await request(app)
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${token}`);
    accountId = accRes.body.data[0].id;

    const catRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${token}`);
    categoryId = catRes.body.data[0].id;
  });

  afterAll(async () => {
    if (userId) {
      await prisma.user.deleteMany({ where: { id: userId } });
    }
    await prisma.$disconnect();
  });

  it('should create an expense transaction and atomically deduct account balance', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountId,
        categoryId,
        amount: 75.50,
        type: 'EXPENSE',
        description: 'University Lab Equipment',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.amount).toBe(75.50);

    // Verify account balance was deducted
    const accRes = await request(app)
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${token}`);
    const acc = accRes.body.data.find((a: any) => a.id === accountId);
    expect(acc.balance).toBe(-75.50);
  });

  it('should create an income transaction and atomically increase account balance', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountId,
        categoryId,
        amount: 500.00,
        type: 'INCOME',
        description: 'Scholarship Award',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const accRes = await request(app)
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${token}`);
    const acc = accRes.body.data.find((a: any) => a.id === accountId);
    expect(acc.balance).toBe(424.50); // -75.50 + 500
  });

  it('should reject transaction creation if required fields are missing or invalid', async () => {
    const res = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        accountId,
        amount: -50, // invalid negative amount
        type: 'INVALID_TYPE',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
