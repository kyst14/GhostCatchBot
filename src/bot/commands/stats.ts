import prisma from '@/db/db.js'
import type { Context } from 'grammy'

export async function statsCommand(ctx: Context) {
	if (!ctx.from?.id) return
	const user = await prisma.user.findUnique({
		where: {
			id: ctx.from.id,
		},
	})

	if (!user) {
		return await ctx.reply(
			`🚫 You are not connected to your Business account. Please use /connect command to help you.`
		)
	}

	await ctx.reply(
		`📊 Statistics for this chat:\n` +
			`- Deleted messages: ${user.messagesDeleted} 🗑️\n` +
			`- Edited messages: ${user.messagesEdited} 📝\n` +
			`- Saved protected messages: ${user.messagesProtected} 🔒\n\n` +
			`📋 Total: ${user.messagesDeleted + user.messagesEdited + user.messagesProtected}`
	)

	await ctx.replyWithSticker(
		'CAACAgQAAxkBAAEqCylqH_4jB4giFAeacWBOkYGulkcMZAACFw8AAlP_iVNxK01zPrG2XzsE'
	)

	return await ctx.reply(
		`To view statistics for a specific chat, open the chat, above click settings button and then click "Manage bot".`
	)
}
