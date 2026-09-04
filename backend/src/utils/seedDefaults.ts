import { PrismaClient } from '@prisma/client';
import { DEFAULT_CATEGORIES } from '../config/constants';

export async function seedUserData(prisma: PrismaClient, userId: string): Promise<void> {
  // Create default Checking Account
  await prisma.account.create({
    data: {
      userId,
      name: 'Primary Checking',
      type: 'CHECKING',
      balance: 0,
      color: '#C27B38',
      isDefault: true,
    },
  });

  // Create default Savings Account
  await prisma.account.create({
    data: {
      userId,
      name: 'Savings Reserve',
      type: 'SAVINGS',
      balance: 0,
      color: '#16A34A',
      isDefault: false,
    },
  });

  // Create default categories for user
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.create({
      data: {
        userId,
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
      },
    });
  }
}
