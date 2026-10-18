/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import bot, { OWN_ID, type MyContext, type MyConversation } from '../lib/bot.js'

export async function handleFeedbackFlowCallback(
	conversation: MyConversation,
	ctx: MyContext,
	userId: number | string,
) {
	await ctx.answerCallbackQuery()

	await ctx.reply(`📨 Write your answer. It will be sent to the user (${userId}).`)

	const { message } = await conversation.waitFor('message')

	await bot.api.sendMessage(
		userId,
		`📨 <b>Answer from admin</b>\n\n`,
		{
			parse_mode: 'HTML',
		}
	)
	await bot.api.copyMessage(userId, OWN_ID, message.message_id)
}
