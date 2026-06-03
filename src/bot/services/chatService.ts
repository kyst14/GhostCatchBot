import prisma from '@/db/db.js'
import type { Context } from 'grammy'

class ChatService {
	async connectChat(ctx: Context) {
		if (!ctx.businessMessage) return
		return await prisma.chat.upsert({
			where: {
				id: ctx.businessMessage?.chat.id,
			},
			update: {},
			create: {
				id: ctx.businessMessage?.chat.id,
				lastAccessedAt: new Date(),
				expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
			},
		})
	}

	async touchChat(id: string | number) {
		const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days

		await prisma.chat.updateMany({
			where: {
				id: Number(id),
			},
			data: {
				lastAccessedAt: new Date(),
				expiresAt,
			},
		})
	}
}

export const chatService = new ChatService()
export default chatService
