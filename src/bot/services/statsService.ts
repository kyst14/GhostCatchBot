/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

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
