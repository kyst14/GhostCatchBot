import { getBot, infoBot, startBot, WEBHOOK } from '@/bot.js'
import express from 'express'
import { webhookCallback } from 'grammy'

const app = express()
const bot = getBot()

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

const HOST = process.env.HOST || '0.0.0.0'

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
	const info = infoBot()

	res.json({
		info,
	})
})

if (WEBHOOK) {
	app.post(WEBHOOK.pathname, webhookCallback(bot, 'express'))
}

app.listen(PORT, HOST, () => {
	console.log('🚀 Server started: ')

	console.log('http://localhost:' + PORT)

	startBot()
})
