/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import { getBot, infoBot, startBot } from '@/bot/index.js'
import express from 'express'
import { webhookCallback } from 'grammy'
import { WEBHOOK } from './bot/lib/bot.js'
import { startCleanupJob } from './utils/cron.js'

const app = express()
const bot = getBot()

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
const HOST = process.env.HOST || '0.0.0.0'

const __dirname = new URL('.', import.meta.url).pathname

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
	//send site/index.html
	res.status(200).sendFile('site/index.html', { root: __dirname })
})

app.get('/health', (req, res) => {
	const info = infoBot()

	res.status(200).json({
		server: {
			ok: true,
			node: process.version,
			uptime: process.uptime(),
		},
		bot: { ok: bot.isRunning(), ...info },
	})
})

if (WEBHOOK) {
	app.post(WEBHOOK.pathname, webhookCallback(bot, 'express'))
}

app.listen(PORT, HOST, () => {
	console.log('🚀 Server started: ')

	console.log('http://localhost:' + PORT)

	startBot()
	startCleanupJob()
})
