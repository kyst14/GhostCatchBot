import env from '@/utils/env.js';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { encryptionExtension } from './prisma-encryption.js';

const adapter = new PrismaNeon({
  connectionString: env.databaseUrl,
});

export const prisma = new PrismaClient({ adapter });

export const db = prisma.$extends(encryptionExtension());

export default db;
