/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import prisma from '@/db/db.js'
import type { MyContext } from '../lib/bot.js'

class ChatService {
	async connectChat(ctx: MyContext) {
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
