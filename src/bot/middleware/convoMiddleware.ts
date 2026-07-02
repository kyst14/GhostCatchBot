/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import type { NextFunction } from 'grammy'
import type { MyContext } from '../lib/bot.js'

export async function convoMiddleware(ctx: MyContext, next: NextFunction) {
	const activeConversations = ctx.conversation.active()

	// Проверяем, запущен ли сейчас у пользователя какой-то диалог
	if (Object.keys(activeConversations).length > 0) {
		if (ctx.hasCommand('cancel')) {
			await ctx.reply('🚫 Action cancelled.')
		} else {
			await ctx.reply(
				'🚫 Current action interrupted in favor of executing a new command.'
			)
		}

		await ctx.conversation.exitAll()
	}

	await next()
}
