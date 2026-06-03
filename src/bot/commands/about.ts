import type { Context } from 'grammy'

export async function aboutCommand(ctx: Context) {
	return await ctx.reply(
		`🤖 <b>Ghost Catch Bot</b>\n\n` +
			`This bot helps you save and track deleted & edited Telegram messages and save protected media.\n\n` +
			`👨‍💻 Developer: @Cat333t\n` +
			`📦 Source code: https://github.com/kyst14/ghostcatchbot\n` +
			`🐛 Issues: https://github.com/kyst14/ghostcatchbot/issues\n` +
			`💬 Feedback: /feedback\n\n` +
			`⚙️ Built with Node.js + TypeScript + Prisma + grammY + Express(Webhook)`,
		{
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: '📦 GitHub',
							url: 'https://github.com/kyst14/ghostcatchbot',
						},
						{ text: '👨‍💻 Dev', url: 'https://t.me/Cat333t' },
					],
					[
						{
							text: '🐛 Issues',
							url: 'https://github.com/kyst14/ghostcatchbot/issues',
						},
					],
				],
			},
		}
	)
}
