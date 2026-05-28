import { getBot, infoBot, startBot, WEBHOOK } from '@/lib/bot.js'
import express from 'express'
import { readFile } from 'fs/promises'
import { webhookCallback } from 'grammy'
import { marked } from 'marked'
import path from 'path'

const app = express()
const bot = getBot()

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
const HOST = process.env.HOST || '0.0.0.0'

const __dirname = new URL('.', import.meta.url).pathname

const md = await readFile(path.join(__dirname, 'site/PRIVACY.md'), 'utf8')
const privacyPage = marked(md)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
	//send site/index.html
	res.status(200).sendFile('site/index.html', { root: __dirname })
})

app.get('/privacy', (req, res) => {
	//send site/PRIVACY.md
	res.status(200).send(`
		<!Doctype html>
		<html lang="en">
			<head>
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.8.1/github-markdown.min.css">
			</head>
			<body class="markdown-body">
				${privacyPage}
			</body>
		</html>
	`)
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
