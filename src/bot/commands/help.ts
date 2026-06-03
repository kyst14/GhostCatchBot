import type { Context } from 'grammy'

export async function helpCommand(ctx: Context) {
	return await ctx.reply(
		`I'm a bot that helps you save and view deleted and edited messages from your Telegram account.\n\n` +
			`Here are the available commands:\n` +
			`- /start: Get started with the bot\n` +
			`- /help: Show this help message\n` +
			`- /connect: Help connect the bot to your Business account\n` +
			`- /feedback: Provide feedback about the bot\n` +
			`- /stats: Show your message statistics\n\n` +
			`Features:\n` +
			`- View deleted messages in Business chats\n` +
			`- View edited messages in Business chats\n` +
			`- Save ephemeral media in private chats (reply to a protected message with media to save it)`
	)
}