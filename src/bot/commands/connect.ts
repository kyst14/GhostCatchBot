/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

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
