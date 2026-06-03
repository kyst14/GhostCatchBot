import prisma from '@/db/db.js'
import type { Context } from 'grammy'

export async function handleBusinessConnection(ctx: Context) {
	const conn = ctx.businessConnection
	if (!conn) return

	// Send welcome message
	if (conn.is_enabled) {
		await ctx.api.sendMessage(
			ctx.businessConnection.user.id,
			`👋 Hello, ${conn.user.first_name}!\n` +
				`You have connected to a Business account.\n` +
				`Now you can:` +
				`\n\n` +
				`- View and delete messages in Business chats` +
				`\n` +
				`- Save ephemeral media in private chats`,
			{ parse_mode: 'HTML' }
		)
		return await ctx.api.sendSticker(
			ctx.businessConnection.user.id,
			'CAACAgQAAxkBAAEqCvBqH_huX7GcaLHxwJogo9VstEYS6QACexEAApr_6FEZmokItQ_wPDsE'
		)
	} else {
		// Disconnect
		await prisma.user.update({
			where: {
				id: conn.user.id,
			},
			data: {
				connId: '',
			},
		})
	}
}
