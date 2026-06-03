import prisma from '@/db/db.js'
import { decryptText } from '@/utils/encryption.js'
import type { Context } from 'grammy'

export async function startCommand(ctx: Context) {
	const chatId = ctx.match?.toString()

	if (chatId && ctx.message) {
		const user = await prisma.user.findUnique({
			where: {
				id: ctx.message?.from.id,
			},
		})

		if (user) {
			const chat = await prisma.chat.findUnique({
				where: {
					id: Number(chatId.replace('bizChat', '')),
				},
			})

			if (!chat) {
				return await ctx.reply(
					`🚫 Chat not found. We don't have any information about this chat.`
				)
			}

			const msg = await prisma.message.findFirst({
				where: {
					chatId: chat.id,
				},
				orderBy: {
					createdAt: 'desc', // Get the latest message in the chat to extract sender name
				},
				select: {
					senderName: true,
				},
			})

			const username = decryptText(msg?.senderName || '') || 'Unknown'

			return await ctx.reply(
				`Chat with @${username}.\n\n` +
					`Statistics for this chat:\n` +
					`- Deleted messages: ${chat.messagesDeleted}\n` +
					`- Edited messages: ${chat.messagesEdited}\n` +
					`- Protected messages: ${chat.messagesProtected}\n\n`
			)
		} else {
			return await ctx.reply(
				`🚫 There was an error processing your request. Please try again later or contact support.`
			)
		}
	}

	await ctx.reply(
		`👋 Hello! I'm a bot that helps you save and view deleted and edited messages from your Telegram account.\n\n` +
			`To get started, please use /help command to see available commands and features.`
	)

	await ctx.replyWithSticker(
		'CAACAgQAAxkBAAEqCt5qH_ZRrr6naLpYVaVaar7KYL1umAACChAAAkKv4FIZCCMqEYiOcjsE'
	)

	await ctx.reply(
		`Using this bot you agree to our <b>Privacy Policy</b>. You can read it here:`,
		{
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: 'Privacy Policy',
							url: 'https://telegra.ph/Privacy-Policy-for-Ghost-Catch-Bot-06-02',
						},
					],
				],
			},
		}
	)
}
