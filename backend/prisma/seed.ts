import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DEFAULT_CATEGORIES } from '../src/config/constants';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SpendWise database with portfolio sample data...');

  // Clean existing data for clean demo
  await prisma.receiptScan.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('DemoPass123!', salt);

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@spendwise.com',
      passwordHash,
      firstName: 'Alex',
      lastName: 'Morgan',
      currency: 'USD',
      monthlyIncomeGoal: 5000,
    },
  });

  console.log(`Created demo user: ${demoUser.email} (Password: DemoPass123!)`);

  // Create accounts
  const checkingAccount = await prisma.account.create({
    data: {
      userId: demoUser.id,
      name: 'Main Checking Account',
      type: 'CHECKING',
      balance: 4250.75,
      color: '#C27B38',
      isDefault: true,
    },
  });

  const savingsAccount = await prisma.account.create({
    data: {
      userId: demoUser.id,
      name: 'High Yield Savings',
      type: 'SAVINGS',
      balance: 12800.0,
      color: '#16A34A',
      isDefault: false,
    },
  });

  const creditCard = await prisma.account.create({
    data: {
      userId: demoUser.id,
      name: 'Sapphire Credit Card',
      type: 'CREDIT_CARD',
      balance: -450.25,
      color: '#2563EB',
      isDefault: false,
    },
  });

  // Seed Categories
  const categoryMap: Record<string, string> = {};
  for (const cat of DEFAULT_CATEGORIES) {
    const created = await prisma.category.create({
      data: {
        userId: demoUser.id,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
        budgetLimit: cat.name === 'Food & Dining' ? 600 : cat.name === 'Groceries' ? 450 : cat.name === 'Transportation' ? 300 : 0,
      },
    });
    categoryMap[cat.name] = created.id;
  }

  // Create Savings Goals
  await prisma.savingsGoal.createMany({
    data: [
      {
        userId: demoUser.id,
        name: 'Emergency Fund (6 Months)',
        targetAmount: 15000,
        currentAmount: 11200,
        targetDate: new Date(2026, 11, 31),
        category: 'Safety Net',
        color: '#16A34A',
        status: 'IN_PROGRESS',
      },
      {
        userId: demoUser.id,
        name: 'MacBook Pro M3 Max for University',
        targetAmount: 2500,
        currentAmount: 2500,
        targetDate: new Date(2026, 8, 1),
        category: 'Tech & Study',
        color: '#2563EB',
        status: 'COMPLETED',
      },
      {
        userId: demoUser.id,
        name: 'Kyoto Tech Conference Trip',
        targetAmount: 3200,
        currentAmount: 1450,
        targetDate: new Date(2026, 10, 15),
        category: 'Travel',
        color: '#D97706',
        status: 'IN_PROGRESS',
      },
    ],
  });

  // Create Budgets for Current & Prior Months
  const now = new Date();
  const curMonth = now.getMonth() + 1;
  const curYear = now.getFullYear();

  await prisma.budget.createMany({
    data: [
      {
        userId: demoUser.id,
        categoryId: null, // Total Monthly Budget
        month: curMonth,
        year: curYear,
        allocatedAmount: 3200,
        alertThreshold: 85,
      },
      {
        userId: demoUser.id,
        categoryId: categoryMap['Food & Dining'],
        month: curMonth,
        year: curYear,
        allocatedAmount: 600,
        alertThreshold: 80,
      },
      {
        userId: demoUser.id,
        categoryId: categoryMap['Groceries'],
        month: curMonth,
        year: curYear,
        allocatedAmount: 450,
        alertThreshold: 80,
      },
      {
        userId: demoUser.id,
        categoryId: categoryMap['Transportation'],
        month: curMonth,
        year: curYear,
        allocatedAmount: 280,
        alertThreshold: 80,
      },
      {
        userId: demoUser.id,
        categoryId: categoryMap['Entertainment'],
        month: curMonth,
        year: curYear,
        allocatedAmount: 200,
        alertThreshold: 75,
      },
    ],
  });

  // Create Historical & Current Transactions
  const seedTransactions = [
    // Current Month Incomes
    {
      description: 'Senior Software Engineer Monthly Salary',
      amount: 4800,
      type: 'INCOME',
      cat: 'Salary & Wages',
      acc: checkingAccount.id,
      daysAgo: 3,
      paymentMethod: 'BANK_TRANSFER',
    },
    {
      description: 'Freelance React Dashboard Project Milestone',
      amount: 850,
      type: 'INCOME',
      cat: 'Freelance & Projects',
      acc: checkingAccount.id,
      daysAgo: 10,
      paymentMethod: 'ONLINE',
    },

    // Current Month Expenses
    {
      description: 'Apartment Monthly Rent & Maintenance',
      amount: 1250,
      type: 'EXPENSE',
      cat: 'Housing & Rent',
      acc: checkingAccount.id,
      daysAgo: 3,
      paymentMethod: 'BANK_TRANSFER',
    },
    {
      description: 'Whole Foods Market Weekly Grocery Haul',
      amount: 142.60,
      type: 'EXPENSE',
      cat: 'Groceries',
      acc: creditCard.id,
      daysAgo: 2,
      paymentMethod: 'CARD',
    },
    {
      description: 'Dinner at Artisan Italian Bistro',
      amount: 78.50,
      type: 'EXPENSE',
      cat: 'Food & Dining',
      acc: creditCard.id,
      daysAgo: 1,
      paymentMethod: 'CARD',
    },
    {
      description: 'Uber to University Campus & Lab',
      amount: 24.80,
      type: 'EXPENSE',
      cat: 'Transportation',
      acc: creditCard.id,
      daysAgo: 1,
      paymentMethod: 'CARD',
    },
    {
      description: 'Fiber High-Speed Internet Bill',
      amount: 65.0,
      type: 'EXPENSE',
      cat: 'Utilities & Bills',
      acc: checkingAccount.id,
      daysAgo: 4,
      paymentMethod: 'ONLINE',
    },
    {
      description: 'Netflix & Spotify Family Subscriptions',
      amount: 32.98,
      type: 'EXPENSE',
      cat: 'Entertainment',
      acc: creditCard.id,
      daysAgo: 5,
      paymentMethod: 'CARD',
    },
    {
      description: 'Starbucks Morning Espresso & Bagel',
      amount: 9.75,
      type: 'EXPENSE',
      cat: 'Food & Dining',
      acc: creditCard.id,
      daysAgo: 0,
      paymentMethod: 'CARD',
    },

    // Prior Month Transactions for analytics comparisons
    {
      description: 'Previous Month Salary',
      amount: 4800,
      type: 'INCOME',
      cat: 'Salary & Wages',
      acc: checkingAccount.id,
      daysAgo: 34,
      paymentMethod: 'BANK_TRANSFER',
    },
    {
      description: 'Prior Apartment Rent',
      amount: 1250,
      type: 'EXPENSE',
      cat: 'Housing & Rent',
      acc: checkingAccount.id,
      daysAgo: 34,
      paymentMethod: 'BANK_TRANSFER',
    },
    {
      description: 'Trader Joe Bulk Groceries',
      amount: 395.20,
      type: 'EXPENSE',
      cat: 'Groceries',
      acc: creditCard.id,
      daysAgo: 25,
      paymentMethod: 'CARD',
    },
    {
      description: 'Dining Out & Weekend Cafes',
      amount: 420.00,
      type: 'EXPENSE',
      cat: 'Food & Dining',
      acc: creditCard.id,
      daysAgo: 20,
      paymentMethod: 'CARD',
    },
    {
      description: 'Fuel & Metro Cards',
      amount: 195.40,
      type: 'EXPENSE',
      cat: 'Transportation',
      acc: creditCard.id,
      daysAgo: 18,
      paymentMethod: 'CARD',
    },
  ];

  for (const item of seedTransactions) {
    const txDate = new Date();
    txDate.setDate(txDate.getDate() - item.daysAgo);

    await prisma.transaction.create({
      data: {
        userId: demoUser.id,
        accountId: item.acc,
        categoryId: categoryMap[item.cat] || categoryMap['General Expense'],
        amount: item.amount,
        type: item.type,
        date: txDate,
        description: item.description,
        paymentMethod: item.paymentMethod,
      },
    });
  }

  console.log('✓ Seeding complete! Database is fully populated.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
