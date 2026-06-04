import prisma from '@/db/db.js'
import { decryptText } from '@/utils/encryption.js'
import type { Context } from 'grammy'
import { escape } from 'html-escaper'
import bot from '../lib/bot.js'
import statsService from '../services/statsService.js'
import tgService from '../services/telegramService.js'
import type { Message } from '@prisma/client'

const MAX_RETRY_TIME = 5000 // 5s
const RETRY_INTERVAL = 500 // 500ms

export async function handleDeletedMessage(ctx: Context) {
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

		statsService.incrementDeleted(original.ownId, original.chatId)

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
