import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Setup pg connection pool
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in .env');
}
const pool = new Pool({ connectionString });

// Setup adapter
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
