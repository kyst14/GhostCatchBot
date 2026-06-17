import { InputFile, type Context } from 'grammy'
import msgService from '../services/messageService.js'
import statsService from '../services/statsService.js'
import tgService from '../services/telegramService.js'

export async function handleBusinessMessage(ctx: Context) {
	if (!(await msgService.isOwn(ctx))) {
		const msg = ctx.businessMessage!

		const media = msgService.extractMedia(msg)
		if (!media) return

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
