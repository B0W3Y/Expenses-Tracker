import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { env } from './env.js';

/**
 * Single shared PrismaClient instance.
 *
 * Prisma 7's `prisma-client` generator talks to Postgres through a driver
 * adapter (node-postgres) instead of a bundled query engine.
 *
 * In development the module can be re-evaluated on hot reload, so we cache the
 * client on `globalThis` to avoid exhausting the database connection pool.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const createClient = () => {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });
};

export const prisma = globalForPrisma.prisma ?? createClient();

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
