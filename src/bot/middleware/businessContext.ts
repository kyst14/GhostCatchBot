import type { Context } from 'grammy'
import userService from '../services/userService.js'
import chatService from '../services/chatService.js'
import msgService from '../services/messageService.js'

export async function businessMiddleware(ctx: Context, next: () => Promise<void>) {
	if (
		!ctx.businessConnection &&
		!ctx.businessMessage &&
		!ctx.update?.business_connection
	) {
		return next()
	}

	const conn = await ctx.getBusinessConnection().catch(() => undefined)

	await userService.connectUser(conn)
	await chatService.connectChat(ctx)

	if (ctx.businessMessage) {
		await chatService.touchChat(ctx.businessMessage.chat.id)
		await msgService.touchMessage(ctx.businessMessage.message_id)
	}

	return next()
}
