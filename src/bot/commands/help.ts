/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

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
