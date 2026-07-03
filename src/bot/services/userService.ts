/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import prisma from '@/db/db.js'
import type { Role } from '@prisma/client'
import type { BusinessConnection } from 'grammy/types'
import { OWN_ID, type MyContext } from '../lib/bot.js'

export class UserService {
	isOwner(ctx: MyContext): boolean {
		return ctx.session.role === 'OWNER'
	}

	isAdmin(ctx: MyContext): boolean {
		return ['ADMIN', 'OWNER'].includes(ctx.session.role)
	}

	getRole(ctx: MyContext): Role {
		return ctx.session.role
	}

	async loadRole(ctx: MyContext): Promise<Role> {
		if (!ctx.from) return 'USER'
		if (ctx.from.id === OWN_ID) return 'OWNER'

		const user = await prisma.user.findUnique({
			where: { id: ctx.from.id },
			select: { role: true },
		})

		return user?.role ?? 'USER'
	}

	async connectUser(ctx: MyContext) {
		let conn: BusinessConnection | undefined = undefined

		// Business connection
		if (
			ctx.has('business_message') ||
			ctx.has('edited_business_message') ||
			ctx.has('business_connection')
		) {
			conn = await ctx.getBusinessConnection()
		}

		const id = conn?.user.id ?? ctx.from!.id
		const username =
			conn?.user.username ??
			conn?.user.first_name ??
			ctx.from?.username ??
			ctx.from?.first_name ??
			'Unknown'
		const connId = conn?.id || null

		return prisma.user.upsert({
			where: { id },
			update: {
				username,
				connId,
			},
			create: {
				id,
				username,
				connId,
			},
		})
	}
}
export const userService = new UserService()
export default userService
