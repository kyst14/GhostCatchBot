import prisma from '@/db/db.js'
import { decryptText } from '@/utils/encryption.js'
import type { Context } from 'grammy'
import bot from '../lib/bot.js'
import { escape } from 'html-escaper'
import statsService from '../services/statsService.js'
import tgService from '../services/telegramService.js'

export async function handleDeletedMessage(ctx: Context) {
	const deleted = ctx.deletedBusinessMessages!

	for (const msgId of deleted.message_ids) {
		const original = await prisma.message.findFirst({
			where: {
				tgId: msgId,
			},
		})
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
				{
					parse_mode: 'HTML',
				}
			)
		} else {
			const encoded = JSON.parse(original.content)

			const fileId = decryptText(encoded.fileId || '')
			const captionText = decryptText(encoded.caption || '')

			if (!fileId) continue

			await bot.api.sendMessage(
				original.ownId.toString(),
				`❌ <b>@${senderName} deleted message: </b>\n\n` +
					`Timestamp: ${original.createdAt.toLocaleString('ru-RU')}`,
				{
					parse_mode: 'HTML',
				}
			)

			await tgService.sendByType(original.ownId.toString(), original.type, fileId, {
				caption: captionText,
			})
		}

		statsService.incrementDeleted(original.ownId, original.chatId)

		await prisma.message.delete({
			where: {
				id: original.id,
			},
		})
	}

	return
}
