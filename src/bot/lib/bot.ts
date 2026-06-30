/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import prisma from '@/db/db.js'
import { Bot } from 'grammy'

export const isDev = process.env.NODE_ENV !== 'production'

export const BOT_TOKEN = process.env.BOT_TOKEN
export const OWN_ID = await prisma.user.findFirst({
	where: { role: 'OWNER' },
	select: { id: true },
}).then((user) => user?.id ? Number(user.id) : -1)
export const WEBHOOK: URL | null =
	!isDev && process.env.WEBHOOK_SECRET && process.env.BASE_URL
		? new URL(process.env.WEBHOOK_SECRET, process.env.BASE_URL)
		: null

if (!BOT_TOKEN) {
	throw new Error('BOT_TOKEN is not defined')
} else if (OWN_ID === -1) { // If OWN_ID is not found in the database
	throw new Error('Owner is not defined in the database. Please run `npm/bun run seed-owner`')
}

export const bot = new Bot(BOT_TOKEN)

export default bot
