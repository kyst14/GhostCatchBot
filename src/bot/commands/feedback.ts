import type { Context } from 'grammy'

export async function feedbackCommand(ctx: Context) {
	return await ctx.reply(
		`📨 Write your feedback here replying to this message. It will be sent to the admin.`,
		{
			reply_markup: {
				force_reply: true,
				input_field_placeholder: 'Write your feedback...',
			},
		}
	)
}