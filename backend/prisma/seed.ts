import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { DEFAULT_CATEGORIES } from '../src/config/constants.js';
import { hashPassword } from '../src/utils/password.js';

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL'] ?? '',
});
const prisma = new PrismaClient({ adapter });

/**
 * Seeds a demo user with the default categories and a few sample expenses.
 * Safe to re-run: it upserts the demo user by email.
 */
async function main() {
  const email = 'demo@expense-tracker.dev';
  const passwordHash = await hashPassword('demo1234');

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Demo User',
      passwordHash,
      categories: { create: DEFAULT_CATEGORIES.map((c) => ({ ...c })) },
    },
    include: { categories: true },
  });

  const food = user.categories.find((c) => c.name === 'Food');
  const transport = user.categories.find((c) => c.name === 'Transportation');

  const existing = await prisma.expense.count({ where: { userId: user.id } });
  if (existing === 0 && food && transport) {
    await prisma.expense.createMany({
      data: [
        {
          userId: user.id,
          categoryId: food.id,
          amount: 12.5,
          description: 'Lunch with friends',
          expenseDate: new Date('2026-07-20'),
        },
        {
          userId: user.id,
          categoryId: transport.id,
          amount: 3.2,
          description: 'Bus ticket',
          expenseDate: new Date('2026-07-21'),
        },
      ],
    });
  }

  console.log(`✅ Seeded demo user: ${email} (password: demo1234)`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
