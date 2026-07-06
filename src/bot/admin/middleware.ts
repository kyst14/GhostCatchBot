/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Ghost Catch Bot is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Ghost Catch Bot. If not, see <https://www.gnu.org/licenses/>.
*/

import userService from '@/bot/services/userService.js'
import { Composer, type NextFunction } from 'grammy'
import { commands } from '../config/commands.js'
import { type MyContext } from '../lib/bot.js'

const adminCommands = commands.ADMIN

export const AdminComposer = new Composer<MyContext>();

export async function AdminMiddleware(ctx: MyContext, next: NextFunction) {
	if (!ctx.from?.id) return await next()

	if (userService.isAdmin(ctx)) {
		return await next()
	} else {
		return;
	}
}

AdminComposer.use(AdminMiddleware);

adminCommands.forEach(command => {
	AdminComposer.command(command.name, command.handler)
})

export default AdminComposer