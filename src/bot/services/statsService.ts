import prisma from '@/db/db.js'

class StatsService {
	async incrementDeleted(userId: number | bigint, chatId: number | bigint) {
		await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				messagesDeleted: {
					increment: 1,
				},
			},
		})

		await prisma.chat.update({
			where: {
				id: chatId,
			},
			data: {
				messagesDeleted: {
					increment: 1,
				},
			},
		})

		return
	}

	async incrementEdited(userId: number | bigint, chatId: number | bigint) {
		await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				messagesEdited: {
					increment: 1,
				},
			},
		})

		await prisma.chat.update({
			where: {
				id: chatId,
			},
			data: {
				messagesEdited: {
					increment: 1,
				},
			},
		})

		return
	}

	async incrementProtected(userId: number | bigint, chatId: number | bigint) {
		await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				messagesProtected: {
					increment: 1,
				},
			},
		})

		await prisma.chat.update({
			where: {
				id: chatId,
			},
			data: {
				messagesProtected: {
					increment: 1,
				},
			},
		})

		return
	}
}

export const statsService = new StatsService()
export default statsService
