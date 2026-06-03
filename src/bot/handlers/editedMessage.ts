import prisma from '@/db/db.js'
import { decryptText, encryptText } from '@/utils/encryption.js'
import type { Context } from 'grammy'
import { escape } from 'html-escaper'
import bot from '../lib/bot.js'

export async function handleEditedMessage(ctx: Context) {
	const msg = ctx.editedBusinessMessage!

	const original = await prisma.message.findFirst({
		where: {
			tgId: msg.message_id,
			chatId: msg.chat.id,
		},
	})
	if (!original) return

	const decrypted = decryptText(original.content)
	if (!decrypted) return

	const senderName = decryptText(original.senderName)
	if (!senderName) return

	if (original) {
		await bot.api.sendMessage(
			original.ownId.toString(),
			`📝 <b>@${senderName} edited message: </b>\n\n` +
				`<b>Original:</b>` +
				`<blockquote>${escape(decrypted)}</blockquote>\n\n` +
				`<b>New:</b> ` +
				`<blockquote>${escape(msg.text ?? '')}</blockquote>\n` +
				`Timestamp: ${original.createdAt.toLocaleString('ru-RU')}`,
			{
				parse_mode: 'HTML',
			}
		)

		await prisma.message.update({
			where: {
				id: original.id,
			},
			data: {
				content: encryptText(msg.text!),
			},
		})
	}

	incrementEdited(original.ownId, msg.chat.id)

	return
}
