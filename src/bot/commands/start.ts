/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import prisma from '@/db/db.js'
import { decryptText } from '@/utils/encryption.js'
import type { Context } from 'grammy'
import { privacyCommand } from './privacy.js'

export async function startCommand(ctx: Context) {
	const chatId = ctx.match?.toString()

	if (chatId && ctx.message) {
		const user = await prisma.user.findUnique({
			where: {
				id: ctx.message?.from.id,
			},
		})

		if (user) {
			const chat = await prisma.chat.findUnique({
				where: {
					tgId_ownId: {
						tgId: Number(chatId.replace('bizChat', '') || chatId),
						ownId: user.id,
					},
				},
			})

			if (!chat) {
				return await ctx.reply(
					`🚫 Chat not found. We don't have any information about this chat.`
				)
			}

			const msg = await prisma.message.findFirst({
				where: {
					tgChatId: Number(chat.id),
				},
				orderBy: {
					createdAt: 'desc', // Get the latest message in the chat to extract sender name
				},
				select: {
					senderName: true,
				},
			})

			const username = decryptText(msg?.senderName || '') || 'Unknown'

			return await ctx.reply(
				`Chat with @${username}.\n\n` +
					`Statistics for this chat:\n` +
					`- Deleted messages: ${chat.messagesDeleted}\n` +
					`- Edited messages: ${chat.messagesEdited}\n` +
					`- Protected messages: ${chat.messagesProtected}\n\n`
			)
		} else {
			return await ctx.reply(
				`🚫 There was an error processing your request. Please try again later or contact support.`
			)
		}
	}

	await ctx.reply(
		`👋 Hello! I'm a bot that helps you save and view deleted and edited messages from your Telegram account.\n\n` +
			`To get started, please use /help command to see available commands and features.`
	)

	await ctx.replyWithSticker(
		'CAACAgQAAxkBAAEqCt5qH_ZRrr6naLpYVaVaar7KYL1umAACChAAAkKv4FIZCCMqEYiOcjsE'
	)

	return await privacyCommand(ctx)
}
