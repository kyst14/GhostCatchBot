import prisma from '@/db/db.js'

type searchQueryType =
	| { id: string }
	| { tgId_ownId: { tgId: number | bigint; ownId: number | bigint } }

class StatsService {
	async incrementDeleted(
		userId: number | bigint,
		{
			id,
			tgId,
			ownId,
		}: { id?: string; tgId?: number | bigint; ownId?: number | bigint }
	) {
		let searchQuery: searchQueryType

		if (id) {
			searchQuery = {
				id,
			}
		} else if (tgId && ownId) {
			searchQuery = {
				tgId_ownId: {
					tgId,
					ownId,
				},
			}
		} else {
			return
		}

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
			where: searchQuery,
			data: {
				messagesDeleted: {
					increment: 1,
				},
			},
		})

		return
	}

	async incrementEdited(
		userId: number | bigint,
		{
			id,
			tgId,
			ownId,
		}: { id?: string; tgId?: number | bigint; ownId?: number | bigint }
	) {
		let searchQuery: searchQueryType

		if (id) {
			searchQuery = {
				id,
			}
		} else if (tgId && ownId) {
			searchQuery = {
				tgId_ownId: {
					tgId,
					ownId,
				},
			}
		} else {
			return
		}
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
			where: searchQuery,
			data: {
				messagesEdited: {
					increment: 1,
				},
			},
		})

		return
	}

	async incrementProtected(
		userId: number | bigint,
		{ id, tgId, ownId }: { id?: string; tgId?: number; ownId?: number }
	) {
		let searchQuery: searchQueryType

		if (id) {
			searchQuery = {
				id,
			}
		} else if (tgId && ownId) {
			searchQuery = {
				tgId_ownId: {
					tgId,
					ownId,
				},
			}
		} else {
			return
		}

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
			where: searchQuery,
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
