/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

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
