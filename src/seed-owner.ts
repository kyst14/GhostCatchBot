/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import prisma from '@/db/db.js'
import { Bot, Context } from 'grammy'
import { randomBytes } from 'node:crypto'

const BOT_TOKEN = process.env.BOT_TOKEN!

const bot = new Bot(BOT_TOKEN)

// random string
const seed = randomBytes(16).toString('hex')

const startTimer = Date.now()
const endTimer = startTimer + 60_000 // 60 seconds

let stop!: () => void

const shouldStop = new Promise<void>(resolve => {
	stop = resolve
})

const initOwner = async (ctx: Context) => {
	if (!ctx.from) return false
	const user = await prisma.user.findUnique({
		where: { role: 'OWNER' },
		select: { id: true },
	})

	if (user && ctx.from?.id !== Number(user.id)) {
		// Reset role
		await prisma.user.update({
			where: { id: user.id },
			data: {
				role: 'USER',
			},
		})
	}

	await prisma.user.upsert({
		where: { id: ctx.from?.id },
		update: {
			username: ctx.from.username ?? ctx.from.first_name,
			role: 'OWNER',
		},
		create: {
			id: ctx.from?.id,
			username: ctx.from.username ?? ctx.from.first_name,
			role: 'OWNER',
		},
	})

	return true
}

bot.command('start', async ctx => {
	const match = ctx.match?.toString()

	if (match === seed && ctx.message) {
		const result = await initOwner(ctx)

		if (result) {
			await ctx.deleteMessages([ctx.message.message_id])
			await ctx.reply('✅ Success! New owner has been set.')

			console.log(`✅ New owner has been set: ${ctx.from?.id}`)

			stop()
		}
	}
})

async function main() {
	if (process.env.NODE_ENV === 'production') {
		console.error(
			'❌ NODE_ENV is set to production. Please run this command in development mode.'
		)
		return
	}

	bot.start()
	bot.catch(err => console.error(err))
	await bot.init()

	const link = `https://t.me/${bot.botInfo.username}?start=${seed}`

	console.clear()

	const interval = setInterval(() => {
		if (Date.now() > endTimer) {
			stop()
		}
		console.clear()
		console.log('\n'.repeat(process.stdout.rows / 2 - 1))
		console.log(`👤 To set you as owner, follow this link: ${link}`)
		console.log(
			`🕒 ${((endTimer - Date.now()) / 1000)
				.toFixed(1)
				.padStart(4, '0')} seconds left`
		)
	}, 100)

	await shouldStop.then(async () => {
		clearInterval(interval)
		await prisma.$disconnect()
		await bot.stop()
		process.exit(0)
	})
}

process.on('SIGINT', async () => {
	console.clear()
	await prisma.$disconnect()
	await bot.stop()
	process.exit(0)
})

main()
