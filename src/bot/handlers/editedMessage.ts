/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import prisma from '@/db/db.js'
import { decryptText, encryptText } from '@/utils/encryption.js'
import type { Context } from 'grammy'
import { escape } from 'html-escaper'
import bot from '../lib/bot.js'
import statsService from '../services/statsService.js'

export async function handleEditedMessage(ctx: Context) {
	const msg = ctx.editedBusinessMessage!
	const conn = await ctx.getBusinessConnection()
	if (!msg.from || !conn) return

	const original = await prisma.message.findUnique({
		where: {
			own_tg_identity: {
				ownId: conn.user.id,
				tgChatId: msg.chat.id,
				tgId: msg.message_id,
			},
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

		statsService.incrementEdited(original.ownId, {
			tgId: original.tgChatId,
			ownId: original.ownId,
		})
	}

	return
}
