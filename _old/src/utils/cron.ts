/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import { prisma } from '@/db/db.js'
import cron from 'node-cron'

export function startCleanupJob() {
	console.log('📅 Cleanup cron registered')

	cron.schedule('0 * * * *', async () => {
		// every hour
		try {
			console.log('🧹 Cleanup started')

			const now = new Date()

			const [messages, chats] = await prisma.$transaction([
				prisma.message.deleteMany({ where: { expiresAt: { lt: now } } }),
				prisma.chat.deleteMany({ where: { expiresAt: { lt: now } } }),
			])

			console.log(
				`✅ Cleanup done: ${messages.count} messages | ${chats.count} chats`
			)
		} catch (err) {
			console.error('❌ Cleanup cron failed:', err)
		}
	})
}
