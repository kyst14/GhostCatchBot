import cron from 'node-cron';
import { prisma } from './db.js';

// Every day at 00:00
cron.schedule('0 * * * *', async () => {
    console.log("🧹 Запуск очистки старых данных...");

    const now = new Date();

	// Delete expired messages
    const deletedMessages = await prisma.message.deleteMany({
        where: {
            expiresAt: { lt: now }
        }
    });

    // Delete expired chats
    const deletedChats = await prisma.chat.deleteMany({
        where: {
            expiresAt: { lt: now }
        }
    });

    console.log(`✅ Removed: ${deletedMessages.count} messages | ${deletedChats.count} chats`);
});