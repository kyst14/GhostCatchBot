import type { MyContext } from '@/bot/context.js';
import { InlineKeyboard } from 'grammy';

export async function startCommand(ctx: MyContext) {
  const keyboard = new InlineKeyboard()
    .text('🔌 How to connect', 'help:connect')
    .row()
    .text('📜 Commands', 'help:commands')
    .text('🔒 Privacy', 'help:privacy');

  await ctx.replyWithPhoto('https://opengraph.githubassets.com/1/kyst14/ghostcatchbot', {
    caption:
      `👻 <b>Ghost Catch Bot</b>\n\n` +
      `I save messages from your <b>Telegram Business</b> chats ` +
      `so you can see deleted and edited ones.\n\n` +
      `Use the buttons below or /help for details.`,
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });

  // await ctx.replyWithSticker(
  // 	'CAACAgQAAxkBAAEqCt5qH_ZRrr6naLpYVaVaar7KYL1umAACChAAAkKv4FIZCCMqEYiOcjsE'
  // );
}
