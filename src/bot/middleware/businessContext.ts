import type { Context } from 'grammy'
import chatService from '../services/chatService.js'
import msgService from '../services/messageService.js'
import userService from '../services/userService.js'

export async function businessMiddleware(ctx: Context, next: () => Promise<void>) {
	if (
		!ctx.businessConnection &&
		!ctx.businessMessage &&
		!ctx.update?.business_connection
	) {
		return next()
	}

	const conn = await ctx.getBusinessConnection().catch(() => undefined)
	if (!conn) return next()

	await userService.connectUser(conn)
	await chatService.connectChat(ctx)

	if (ctx.businessMessage) {
		await msgService.touchMessage(ctx)
	}

	return next()
}
