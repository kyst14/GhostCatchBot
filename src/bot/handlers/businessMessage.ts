import { encryptText } from '@/utils/encryption.js'
import { InputFile, type Context } from 'grammy'
import msgService from '../services/messageService.js'
import tgService from '../services/telegramService.js'
import statsService from '../services/statsService.js'

export async function handleBusinessMessage(ctx: Context) {
	if (!(await msgService.isOwn(ctx))) {
		const msg = ctx.businessMessage!

		const ownId = await ctx.getBusinessConnection().then(conn => conn.user.id)

		msgService.saveBusinessMessage(ctx, msg, {
			type: 'TEXT',
			content: encryptText(msg.text ?? ''),
		})

		return
	} else if (
		(await msgService.isOwn(ctx)) &&
		!!ctx.businessMessage?.reply_to_message &&
		ctx.businessMessage?.reply_to_message.has_protected_content === true
	) {
		const msg = ctx.businessMessage!.reply_to_message!
		const captionText = msg.caption ?? msg.text

		const ownId = await ctx.getBusinessConnection().then(conn => conn.user.id)

		const { type } = msgService.extractMedia(msg) || {}

		if (type === 'PHOTO' || type === 'VIDEO') {
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
		}

		statsService.incrementProtected(ownId, msg.chat.id)
	}
}
