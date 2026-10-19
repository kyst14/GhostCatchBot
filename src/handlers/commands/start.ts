/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

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
      `🔐 All data is encrypted\n` +
      `⏱ Messages auto-expire for privacy\n` +
      `📊 View stats anytime\n\n` +
      `Use the buttons below or /help for details.`,
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });

  // await ctx.replyWithSticker(
  // 	'CAACAgQAAxkBAAEqCt5qH_ZRrr6naLpYVaVaar7KYL1umAACChAAAkKv4FIZCCMqEYiOcjsE'
  // );
}
