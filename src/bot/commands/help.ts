/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import { commands } from '../config/commands.js'
import type { MyContext } from '../lib/bot.js'
import userService from '../services/userService.js'

export async function helpCommand(ctx: MyContext) {
	const userCommands = commands.USER
		.map(c => `/${c.command} - ${c.description}`)
		.join('\n')

	const adminCommands =
		userService.isAdmin(ctx)
			? commands.ADMIN
					.map(c => `/${c.command} - ${c.description}`)
					.join('\n')
			: ''

	const ownerCommands =
		userService.isOwner(ctx)
			? commands.OWNER
					.map(c => `/${c.command} - ${c.description}`)
					.join('\n')
			: ''

	console.log('User commands:', adminCommands)
	console.log('Owner commands:', ownerCommands)

	const text =
		`I'm a bot that helps you save and view deleted and edited messages from your Telegram account.\n\n` +
		`📋 Available commands:\n` +
		userCommands +
		(adminCommands ? `\n\n🛠 Admin commands:\n${adminCommands}` : '') +
		(ownerCommands ? `\n\n👑 Owner commands:\n${ownerCommands}` : '') +
		`\n\nFeatures:\n` +
		`- View deleted messages in Business chats\n` +
		`- View edited messages in Business chats\n` +
		`- Save ephemeral media in private chats (reply to a protected message with media to save it)`

	return ctx.reply(text)
}
