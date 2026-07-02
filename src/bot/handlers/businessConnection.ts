/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import prisma from '@/db/db.js'
import type { MyContext } from '../lib/bot.js'

export async function handleBusinessConnection(ctx: MyContext) {
	const conn = ctx.businessConnection
	if (!conn) return

	// Send welcome message
	if (conn.is_enabled) {
		await ctx.api.sendMessage(
			ctx.businessConnection.user.id,
			`👋 Hello, ${conn.user.first_name}!\n` +
				`You have connected to a Business account.\n` +
				`Now you can:` +
				`\n\n` +
				`- View and delete messages in Business chats` +
				`\n` +
				`- Save ephemeral media in private chats`,
			{ parse_mode: 'HTML' }
		)
		return await ctx.api.sendSticker(
			ctx.businessConnection.user.id,
			'CAACAgQAAxkBAAEqCvBqH_huX7GcaLHxwJogo9VstEYS6QACexEAApr_6FEZmokItQ_wPDsE'
		)
	} else {
		// Disconnect
		await prisma.user.update({
			where: {
				id: conn.user.id,
			},
			data: {
				connId: null,
			},
		})
	}
}
