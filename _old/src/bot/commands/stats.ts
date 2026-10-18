/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import prisma from '@/db/db.js'
import type { MyContext } from '../lib/bot.js'

export async function statsCommand(ctx: MyContext) {
	if (!ctx.from?.id) return

	const loading = await ctx.reply('𝙇𝙤𝙖𝙙𝙞𝙣𝙜...') // loading

	const user = await prisma.user.findUnique({
		where: {
			id: ctx.from.id,
		},
	})

	await ctx.deleteMessages([loading.message_id])
	if (!user) {
		return await ctx.reply(
			`🚫 You are not connected to your Business account. Please use /connect command to help you.`
		)
	}

	await ctx.reply(
		`📊 Statistics for this chat:\n` +
			`- Deleted messages: ${user.messagesDeleted} 🗑️\n` +
			`- Edited messages: ${user.messagesEdited} 📝\n` +
			`- Saved protected messages: ${user.messagesProtected} 🔒\n\n` +
			`📋 Total: ${user.messagesDeleted + user.messagesEdited + user.messagesProtected}`
	)

	await ctx.replyWithSticker(
		'CAACAgQAAxkBAAEqCylqH_4jB4giFAeacWBOkYGulkcMZAACFw8AAlP_iVNxK01zPrG2XzsE'
	)

	return await ctx.reply(
		`To view statistics for a specific chat, open the chat, above click settings button and then click "Manage bot".`
	)
}
