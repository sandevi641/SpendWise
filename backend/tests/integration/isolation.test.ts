import request from 'supertest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';

const app = createApp();

describe('Multi-Tenant User Data Isolation Tests', () => {
  let userAToken: string;
  let userBToken: string;
  let userATxId: string;
  let userAId: string;
  let userBId: string;

  beforeAll(async () => {
    // Register User A
    const resA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `usera_${Date.now()}@spendwise.com`,
        password: 'Password123!',
        firstName: 'User',
        lastName: 'A',
      });
    userAToken = resA.body.data.token;
    userAId = resA.body.data.user.id;

    // Register User B
    const resB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `userb_${Date.now()}@spendwise.com`,
        password: 'Password123!',
        firstName: 'User',
        lastName: 'B',
      });
    userBToken = resB.body.data.token;
    userBId = resB.body.data.user.id;

    // Get User A's account & category
    const accRes = await request(app)
      .get('/api/v1/accounts')
      .set('Authorization', `Bearer ${userAToken}`);
    const catRes = await request(app)
      .get('/api/v1/categories')
      .set('Authorization', `Bearer ${userAToken}`);

    // Create a transaction for User A
    const txRes = await request(app)
      .post('/api/v1/transactions')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        accountId: accRes.body.data[0].id,
        categoryId: catRes.body.data[0].id,
        amount: 199.99,
        type: 'EXPENSE',
        description: "User A's Confidential Expense",
      });
    userATxId = txRes.body.data.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [userAId, userBId] } },
    });
    await prisma.$disconnect();
  });

  it('should NOT allow User B to access or see User A transaction by ID', async () => {
    const res = await request(app)
      .get(`/api/v1/transactions/${userATxId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(404);
  });

  it('should NOT return User A transactions in User B transaction list', async () => {
    const res = await request(app)
      .get('/api/v1/transactions')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(200);
    const hasUserATx = res.body.data.some((tx: any) => tx.id === userATxId);
    expect(hasUserATx).toBe(false);
  });

  it('should NOT allow User B to delete User A transaction', async () => {
    const res = await request(app)
      .delete(`/api/v1/transactions/${userATxId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(400); // Transaction not found for User B
  });
});
