import type { Context } from 'grammy'

export async function businessMiddleware(ctx: Context, next: () => Promise<void>) {
	if (
		!ctx.businessConnection &&
		!ctx.businessMessage &&
		!ctx.update?.business_connection
	) {
		return next()
	}

	const conn = await ctx.getBusinessConnection().catch(() => undefined)

	await connectUser(conn)
	await connectChat(ctx)

	if (ctx.businessMessage) {
		await touchChat(ctx.businessMessage.chat.id)
		await touchMessage(ctx.businessMessage.message_id)
	}

	return next()
}
