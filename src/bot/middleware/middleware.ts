/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import type { MyContext } from '../lib/bot.js'
import msgService from '../services/messageService.js'
import userService from '../services/userService.js'

export async function mainMiddleware(ctx: MyContext, next: () => Promise<void>) {
	await userService.connectUser(ctx)

	return next()
}

export async function businessMiddleware(ctx: MyContext, next: () => Promise<void>) {
	if (
		!ctx.businessConnection &&
		!ctx.businessMessage &&
		!ctx.update?.business_connection
	) {
		return next()
	}

	const conn = await ctx.getBusinessConnection().catch(() => undefined)
	if (!conn) return next()

	await userService.connectUser(ctx)

	if (ctx.businessMessage) {
		await msgService.touchMessage(ctx)
	}

	return next()
}
