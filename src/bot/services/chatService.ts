import prisma from '@/db/db.js'
import type { Context } from 'grammy'

class ChatService {
	async connectChat(ctx: Context) {
		const conn = await ctx.getBusinessConnection()
		if (!conn || !ctx.businessMessage) return
		return await prisma.chat.upsert({
			where: {
				tgId_ownId: {
					tgId: ctx.businessMessage.chat.id,
					ownId: conn.user.id,
				},
			},
			update: {
				lastAccessedAt: new Date(),
				expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
			},
			create: {
				tgId: ctx.businessMessage?.chat.id,
				lastAccessedAt: new Date(),
				expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),

				own: {
					connect: {
						id: conn.user.id,
					},
				},
			},
		})
	}
}

export const chatService = new ChatService()
export default chatService
