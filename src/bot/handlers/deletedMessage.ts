/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import prisma from '@/db/db.js'
import { decryptText } from '@/utils/encryption.js'
import type { Message } from '@prisma/client'
import { escape } from 'html-escaper'
import bot, { type MyContext } from '../lib/bot.js'
import statsService from '../services/statsService.js'
import tgService from '../services/telegramService.js'

const MAX_RETRY_TIME = 5000 // 5s
const RETRY_INTERVAL = 500 // 500ms

export async function handleDeletedMessage(ctx: MyContext) {
	const deleted = ctx.deletedBusinessMessages!

	for (const msgId of deleted.message_ids) {
		let original = await prisma.message.findFirst({
			where: { tgId: msgId },
		})

		if (!original) {
			original = await retryFindMessage(msgId)
		}

		if (!original) continue

		const senderName = decryptText(original.senderName)
		if (!senderName) continue

		if (original.type === 'TEXT') {
			const content = decryptText(original.content)
			await bot.api.sendMessage(
				original.ownId.toString(),
				`❌ <b>@${senderName} deleted message: </b>\n\n` +
					`<b>Original:</b>` +
					`<blockquote>` +
					`${escape(content)}` +
					`</blockquote>\n\n` +
					`Timestamp: ${original.createdAt.toLocaleString('ru-RU')}`,
				{ parse_mode: 'HTML' }
			)
		} else {
			const encoded = JSON.parse(decryptText(original.content))
			const fileId: string = encoded.fileId || ''
			const captionText: string = encoded.caption || ''

			if (!fileId) continue

			await bot.api.sendMessage(
				original.ownId.toString(),
				`❌ <b>@${senderName} deleted message: </b>\n\n` +
					`Timestamp: ${original.createdAt.toLocaleString('ru-RU')}`,
				{ parse_mode: 'HTML' }
			)

			await tgService.sendByType(original.ownId.toString(), original.type, fileId, {
				caption: captionText,
			})
		}

		statsService.incrementDeleted(original.ownId, {
			tgId: original.tgChatId,
			ownId: original.ownId,
		})

		await prisma.message.delete({
			where: { id: original.id },
		})
	}
}

async function retryFindMessage(msgId: number): Promise<Message | null> {
	const startTime = Date.now()

	while (Date.now() - startTime < MAX_RETRY_TIME) {
		await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL))

		const message = await prisma.message.findFirst({
			where: { tgId: msgId },
		})

		if (message) return message
	}

	return null
}
