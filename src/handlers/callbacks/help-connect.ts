import type { MyContext } from '@/bot/context.js';
import type { CallbackQueryContext } from 'grammy';
import { connectCommand } from '../commands/connect.js';

export async function helpConnectCallback(ctx: CallbackQueryContext<MyContext>) {
	await ctx.answerCallbackQuery();

	await connectCommand(ctx);
}