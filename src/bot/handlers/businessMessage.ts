/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import { InputFile } from 'grammy'
import type { MyContext } from '../lib/bot.js'
import msgService from '../services/messageService.js'
import statsService from '../services/statsService.js'
import tgService from '../services/telegramService.js'
import chatService from '../services/chatService.js'

export async function handleBusinessMessage(ctx: MyContext) {
	if (!(await msgService.isOwn(ctx))) {
		const msg = ctx.businessMessage!

		const media = msgService.extractMedia(msg)
		if (!media) return

		await chatService.connectChat(ctx)
		return await msgService.saveBusinessMessage(ctx, msg, media)
	} else if (
		(await msgService.isOwn(ctx)) &&
		!!ctx.businessMessage?.reply_to_message &&
		ctx.businessMessage?.reply_to_message.has_protected_content === true
	) {
		const msg = ctx.businessMessage!.reply_to_message!
		const captionText = msg.caption ?? msg.text

		const ownId = await ctx.getBusinessConnection().then(conn => conn.user.id)

		const media = msgService.extractMedia(msg)
		if (!media) return

		if (media.type === 'PHOTO' || media.type === 'VIDEO') {
			const file = msg.photo?.at(-1) || msg.video // Get the highest resolution photo
			if (!file) return
			const { buffer } = await tgService.downloadFile(file.file_id).catch(() => {
				ctx.api.sendMessage(
					ownId.toString(),
					`⚠️ Failed to fetch the file. It might be too large or unavailable.`
				)
				return { buffer: undefined }
			})
			if (!buffer) return

			await ctx.api.sendPhoto(ownId.toString(), new InputFile(buffer), {
				caption: captionText ?? '',
			})

			await msgService.saveBusinessMessage(ctx, msg, media)

			statsService.incrementProtected(ownId, {
				tgId: msg.chat.id,
				ownId,
			})
			return
		}
	}
}
