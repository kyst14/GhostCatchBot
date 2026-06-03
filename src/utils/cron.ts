import { prisma } from '@/db/db.js'
import cron from 'node-cron'

export function startCleanupJob() {
	console.log('📅 Cleanup cron registered')

	cron.schedule('0 * * * *', async () => {
		// every hour
		try {
			console.log('🧹 Cleanup started')

			const now = new Date()

			const [messages, chats] = await prisma.$transaction([
				prisma.message.deleteMany({ where: { expiresAt: { lt: now } } }),
				prisma.chat.deleteMany({ where: { expiresAt: { lt: now } } }),
			])

			console.log(
				`✅ Cleanup done: ${messages.count} messages | ${chats.count} chats`
			)
		} catch (err) {
			console.error('❌ Cleanup cron failed:', err)
		}
	})
}
