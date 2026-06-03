import { Bot } from 'grammy'

export const isDev = process.env.NODE_ENV !== 'production'

export const BOT_TOKEN = process.env.BOT_TOKEN
export const ADMIN_ID = Number(process.env.ADMIN_ID!)
export const WEBHOOK: URL | null =
	!isDev && process.env.WEBHOOK_SECRET && process.env.BASE_URL
		? new URL(process.env.WEBHOOK_SECRET, process.env.BASE_URL)
		: null

if (!BOT_TOKEN) {
	throw new Error('BOT_TOKEN is not defined')
} else if (!ADMIN_ID) {
	throw new Error('ADMIN_ID is not defined')
}

export const bot = new Bot(BOT_TOKEN)

export default bot
