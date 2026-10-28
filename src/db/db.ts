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

async function checkDatabase(): Promise<void> {
  try {
    await db.$connect();
    console.log('✅ Database connected');

    const user = await db.user.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        username: 'admin',
        role: 'ADMIN',
      },
    });

    console.log('✅ User upserted:', user);

    const chat = await db.chat.upsert({
      where: { tgId_ownId: { tgId: 123456789, ownId: user.id } },
      update: {},
      create: {
        tgId: 123456789,
        ownId: user.id,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    await db.message.create({
      data: {
        tgId: 987654322,
        type: 'TEXT',
        content: 'Hello, this is a test message.',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        senderName: 'Test User',
        own: {
          connect: {
            id: user.id,
          },
        },
        chat: {
          connect: {
            id: chat.id,
          },
        },
      },
    });
    console.log('✅ Chat upserted:', chat);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

checkDatabase();

export default db;
