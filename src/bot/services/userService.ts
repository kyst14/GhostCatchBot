/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import prisma from '@/db/db.js'
import type { Context } from 'grammy'
import type { BusinessConnection } from 'grammy/types'

export class UserService {
	async connectUser(ctx: Context) {
		if (!ctx.from || !ctx.chat) return

		let conn: BusinessConnection | undefined = undefined

		// Business connection
		if ( 
			ctx.has('business_message') ||
			ctx.has('edited_business_message') ||
			ctx.has('business_connection')
		) {
			conn = await ctx.getBusinessConnection()
		}

		const id = conn?.user.id ?? ctx.from.id
		const username =
			conn?.user.username ??
			conn?.user.first_name ??
			ctx.from.username ??
			ctx.from.first_name
		const connId = conn?.id ?? ''

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
