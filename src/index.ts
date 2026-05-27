import { getBot, infoBot, startBot, WEBHOOK } from '@/bot.js'
import express from 'express'
import { webhookCallback } from 'grammy'

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
})
