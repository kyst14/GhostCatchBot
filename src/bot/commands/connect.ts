import type { Context } from 'grammy'

export async function connectCommand(ctx: Context) {
	return await ctx.reply(
		`❓ Connect the bot to your Business account:\n\n
			1. Click "🔌 Connect" button
			2. Choose "Chat automation" and write in the input field: @${ctx.me?.username}`,
		{
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: '🔌 Connect',
							url: `tg://settings/edit/`,
						},
					],
				],
			},
			parse_mode: 'HTML',
		}
	)
}
