/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import { InlineKeyboard, type Context, type NextFunction } from 'grammy'
import { OWN_ID } from '../lib/bot.js'

export async function handleFeedbackFlow(ctx: Context, next: NextFunction) {
	const replyTo = ctx.message?.reply_to_message

	if (!replyTo) return await next()

	const replyText = replyTo.text || ''

	// --- ADMIN ---
	if (ctx.from?.id === OWN_ID) {
		const match = replyText.match(/ID:\s*(\d+)/)

		if (match) {
			const userId = match[1] || ''

			try {
				await ctx.api.sendMessage(userId, `📨 <b>Message from admin:</b>`, {
					parse_mode: 'HTML',
				})
				await ctx.api.copyMessage(
					userId,
					ctx.message.chat.id,
					ctx.message.message_id
				)
				return await ctx.reply('✅ Reply sended successfully to the user!')
			} catch (err) {
				console.error(err)
				return await ctx.reply(
					'❌ Failed to send reply to the user. Probably the user has blocked the bot.'
				)
			}
		}
	}

	// --- USER FEEDBACK ---
	const isOfficialFeedbackRequest = replyText.includes(
		'Write your feedback here replying to this message'
	)

	if (isOfficialFeedbackRequest) {
		try {
			const keyboard = new InlineKeyboard().text(
				'✏️ Reply',
				`reply_to:${ctx.from?.id}`
			)

			await ctx.api.sendMessage(
				OWN_ID,
				`📨 <b>Message from @${ctx.from?.username || ctx.from?.first_name}:</b>`,
				{ parse_mode: 'HTML' }
			)

			await ctx.api.copyMessage(
				OWN_ID,
				ctx.message.chat.id,
				ctx.message.message_id,
				{ reply_markup: keyboard }
			)

			ctx.react('❤')

			return await ctx.reply('👍 Thank you! Your message was sended to admin!')
		} catch (err) {
			console.error(err)
			return await ctx.reply('❌ Failed to send message to the admin.')
		}
	}
}

export async function handleFeedbackFlowCallback(ctx: Context) {
	const userId = ctx.match?.[1]
	if (!userId) return

	await ctx.answerCallbackQuery()
	await ctx.reply(
		`📨 Write your answer (ID: ${userId}). It will be sent to the user.`,
		{
			reply_markup: {
				force_reply: true,
				input_field_placeholder: 'Write your answer...',
			},
		}
	)
}
