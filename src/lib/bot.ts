import prisma from '@/lib/db.js'
import 'dotenv/config'
import { Bot, Context, InputFile } from 'grammy'
import type { BusinessConnection, Message, ParseMode } from 'grammy/types'
import { escape } from 'html-escaper'
import { decryptBuffer, decryptText, encryptBuffer, encryptText } from './encryption.js'

const isDev = process.env.NODE_ENV !== 'production'

// Bot config
const BOT_TOKEN = process.env.BOT_TOKEN
const ADMIN_ID = process.env.ADMIN_ID!
export const WEBHOOK: URL | null =
	!isDev && process.env.WEBHOOK_SECRET && process.env.BASE_URL
		? new URL(process.env.WEBHOOK_SECRET, process.env.BASE_URL)
		: null

if (!BOT_TOKEN) {
	throw new Error('BOT_TOKEN is not defined')
} else if (!ADMIN_ID) {
	throw new Error('ADMIN_ID is not defined')
}

interface MyContext extends Context {
	state: {
		conn: BusinessConnection | undefined
	}
}

const bot = new Bot<MyContext>(BOT_TOKEN)

bot.command('start', async ctx => {
	return await ctx.reply(
		'👋 Hello, I am <b>Ghost Catcher</b>! Connect me to a Business account and I will work!',
		{ parse_mode: 'HTML' }
	)
})

bot.use(async (ctx, next) => {
	const conn =
		(await ctx.getBusinessConnection().catch(() => undefined)) ||
		ctx.update?.business_connection ||
		undefined
	const msg = ctx.businessMessage

	// Connect user and chat
	await connectUser(conn)
	await connectChat(ctx)

	if (msg) {
		// Touch message
		await touchChat(msg.chat.id)
		await touchMessage(msg.message_id)
	}

	ctx.state.conn = conn

	return await next()
})

// Ловим подключение бота к Business аккаунту
bot.on('business_connection', async ctx => {
	const conn = ctx.businessConnection

	// Send welcome message
	if (conn.is_enabled) {
		return await ctx.api.sendMessage(
			ctx.businessConnection.user.id,
			`👋 Hello, ${conn.user.first_name}!\n` +
				`You have connected to a Business account.\n` +
				`Now you can:` +
				`\n\n` +
				`- View and delete messages in Business chats` +
				`\n` +
				`- Save ephemeral media in private chats`,
			{ parse_mode: 'HTML' }
		)
	} else {
		// Disconnect
		await prisma.user.update({
			where: {
				id: conn.user.id,
			},
			data: {
				connId: '',
			},
		})
	}
})

// Новое сообщение в Business чате
bot.on('business_message').filter(
	async ctx => {
		return !(await isOwn(ctx))
	},
	async ctx => {
		const msg = ctx.businessMessage!

		const ownId = await ctx.getBusinessConnection().then(conn => conn.user.id)

		const createdAt = new Date(msg.date * 1000)

		const type = getMessageType(msg)

		if (type === 'UNKNOWN') return

		let content = ''

		if (type === 'TEXT') {
			content = encryptText(msg.text!)
		} else if (type === 'PHOTO' || type === 'VIDEO') {
			const file = msg.photo?.at(-1) || msg.video // Get the highest resolution photo
			if (!file) return
			const buffer = await getFileBuffer(file.file_id).catch(() => {
				ctx.api.sendMessage(
					ownId.toString(),
					`⚠️ Failed to fetch the file. It might be too large or unavailable.`
				)
				return null
			})
			if (!buffer) return

			const encrypted =
				encryptBuffer(buffer).toString('base64') +
				'/&/' +
				encryptText(msg.text ?? '')

			content = encrypted
		}

		// Save messages to DB
		await prisma.message.create({
			data: {
				tgId: msg.message_id,
				type,
				content,
				senderName: encryptText(msg.from.username || msg.from.first_name),
				createdAt,
				expiresAt: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days

				chat: {
					connect: {
						id: msg.chat.id,
					},
				},
				own: {
					connect: {
						id: ownId,
					},
				},
			},
		})

		return
	}
)

// Save one-time media
bot.on('business_message').filter(
	async ctx => {
		return (
			(await isOwn(ctx)) &&
			!!ctx.businessMessage.reply_to_message &&
			ctx.businessMessage.reply_to_message.has_protected_content === true
		)
	},
	async ctx => {
		const msg = ctx.businessMessage!.reply_to_message!
		const captionText = msg.caption ?? msg.text

		const ownId = await ctx.getBusinessConnection().then(conn => conn.user.id)

		const type = getMessageType(msg)
		if (type === 'UNKNOWN') return

		if (type === 'PHOTO' || type === 'VIDEO') {
			const file = msg.photo?.at(-1) || msg.video // Get the highest resolution photo
			if (!file) return
			const buffer = await getFileBuffer(file.file_id).catch(() => {
				ctx.api.sendMessage(
					ownId.toString(),
					`⚠️ Failed to fetch the file. It might be too large or unavailable.`
				)
				return null
			})
			if (!buffer) return

			await ctx.api.sendPhoto(ownId.toString(), new InputFile(buffer), {
				caption: captionText ?? '',
			})
		}
	}
)

// Message edited
bot.on('edited_business_message:text', async ctx => {
	const msg = ctx.editedBusinessMessage!

	const original = await prisma.message.findFirst({
		where: {
			tgId: msg.message_id,
			chatId: msg.chat.id,
		},
	})
	if (!original) return

	const decrypted = decryptText(original.content)
	if (!decrypted) return

	const senderName = decryptText(original.senderName)
	if (!senderName) return

	if (original) {
		await bot.api.sendMessage(
			original.ownId.toString(),
			`📝 <b>@${senderName} edited message: </b>\n\n` +
				`<b>Original:</b>` +
				`<blockquote>${escape(decrypted)}</blockquote>\n\n` +
				`<b>New:</b> ` +
				`<blockquote>${escape(msg.text ?? '')}</blockquote>\n` +
				`Timestamp: ${original.createdAt.toLocaleString()}`,
			{
				parse_mode: 'HTML',
			}
		)

		await prisma.message.update({
			where: {
				id: original.id,
			},
			data: {
				content: encryptText(msg.text!),
			},
		})
	}

	return
})

// Message deleted
bot.on('deleted_business_messages', async ctx => {
	const deleted = ctx.deletedBusinessMessages!

	for (const msgId of deleted.message_ids) {
		const original = await prisma.message.findFirst({
			where: {
				tgId: msgId,
			},
		})
		if (!original) continue

		const senderName = decryptText(original.senderName)
		if (!senderName) continue

		if (original.type === 'TEXT') {
			const content = decryptText(original.content)
			await bot.api.sendMessage(
				original.ownId.toString(),
				`❌ <b>@${senderName} deleted message: </b>\n\n` +
					`<b>Original:</b>` +
					`<blockquote>` +
					`${escape(content)}` +
					`</blockquote>\n\n` +
					`Timestamp: ${original.createdAt.toLocaleString()}`,
				{
					parse_mode: 'HTML',
				}
			)
		} else if (original.type === 'PHOTO' || original.type === 'VIDEO') {
			const encoded = original.content.split('/&/')
			if (encoded.length !== 2) continue

			const content = decryptBuffer(Buffer.from(encoded[0]!, 'base64'))
			const captionText = decryptText(encoded[1]!)

			if (!content) continue
			const options = {
				caption:
					`❌ <b>@${senderName} deleted a ${original.type.toLowerCase()}</b>\n\n` +
					(captionText
						? `<b>Caption:</b>\n<blockquote>${escape(captionText)}</blockquote>\n\n`
						: '') +
					`Timestamp: ${original.createdAt.toLocaleString()}`,
				parse_mode: 'HTML' as ParseMode,
			}

			if (original.type === 'PHOTO') {
				await bot.api.sendPhoto(
					original.ownId.toString(),
					new InputFile(content),
					options
				)
			} else if (original.type === 'VIDEO') {
				await bot.api.sendVideo(
					original.ownId.toString(),
					new InputFile(content),
					options
				)
			} else {
				continue
			}
		}

		await prisma.message.delete({
			where: {
				id: original.id,
			},
		})
	}

	return
})

function onError(err: Error) {
	if (isDev) {
		console.error('❌ Uncaught Exception:', err)
		process.exit(1)
	} else {
		bot.api.sendMessage(ADMIN_ID, `❌ Uncaught Exception: ${err.message}`)
	}
}

bot.catch(onError)
process.on('unhandledRejection', onError)
process.on('uncaughtException', onError)

process.on('SIGTERM', () => {
	bot.stop()
	process.exit(0)
})

export async function startBot() {
	console.log('🚀 Starting bot...')

	let res

	await bot.init()
	if (WEBHOOK) {
		res = await bot.api.setWebhook(WEBHOOK.toString())
		console.log('📡 setWebhook response:', res)
	} else {
		await bot.api.deleteWebhook()
		bot.start()
	}

	console.log('✅ Bot started\n')

	// show bot info beautify
	console.log(
		`👤 Bot info:\n` +
			` - ID: ${bot.botInfo.id}\n` +
			` - Username: ${bot.botInfo.username}\n` +
			` - First name: ${bot.botInfo.first_name}\n` +
			` - Webhook: ${res ? 'Enabled' : 'Disabled'}\n`
	)

	return
}

export function infoBot() {
	return {
		id: bot.botInfo.id,
		first_name: bot.botInfo.first_name,
		username: bot.botInfo.username,
		is_running: bot.isRunning(),
	}
}

export function getBot() {
	return bot
}

async function connectUser(conn: BusinessConnection | undefined) {
	if (!conn) return
	return await prisma.user.upsert({
		where: {
			id: conn.user.id,
		},
		update: {
			username: conn.user.username || conn.user.first_name,
			connId: conn.id,
		},
		create: {
			id: conn.user.id,
			username: conn.user.username || conn.user.first_name,
			connId: conn.id,
		},
	})
}

async function connectChat(ctx: MyContext) {
	if (!ctx.businessMessage) return
	return await prisma.chat.upsert({
		where: {
			id: ctx.businessMessage?.chat.id,
		},
		update: {},
		create: {
			id: ctx.businessMessage?.chat.id,
			lastAccessedAt: new Date(),
			expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
		},
	})
}

async function isOwn(ctx: MyContext): Promise<boolean> {
	const conn = await ctx.getBusinessConnection()
	const user = conn.user

	if (!user) return false
	return user.id === ctx.businessMessage?.from?.id
}

// Touch
async function touchMessage(id: string | number) {
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

	await prisma.message.updateMany({
		where: {
			tgId: Number(id),
		},
		data: {
			lastAccessedAt: new Date(),
			expiresAt,
		},
	})
}

async function touchChat(id: string | number) {
	const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days

	await prisma.chat.updateMany({
		where: {
			id: Number(id),
		},
		data: {
			lastAccessedAt: new Date(),
			expiresAt,
		},
	})
}

function getMessageType(msg: Message) {
	if (msg.text) return 'TEXT'
	if (msg.photo) return 'PHOTO'
	if (msg.video) return 'VIDEO'
	// if (msg.animation) return 'GIF'
	// if (msg.document) return 'DOCUMENT'
	// if (msg.audio) return 'AUDIO'
	// if (msg.voice) return 'VOICE'
	// if (msg.video_note) return 'VIDEO_NOTE'
	// if (msg.sticker) return 'STICKER'
	// if (msg.location) return 'LOCATION'
	// if (msg.contact) return 'CONTACT'
	// if (msg.poll) return 'POLL'

	return 'UNKNOWN'
}

async function getFileBuffer(fileId: string): Promise<Buffer> {
	const file = await bot.api.getFile(fileId)

	if (!file.file_path) {
		throw new Error('No file path')
	}

	const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`

	const controller = new AbortController()
	const timeout = setTimeout(() => controller.abort(), 15_000) // 15 seconds

	try {
		const response = await fetch(url, {
			signal: controller.signal,
		})

		if (!response.ok) {
			throw new Error(
				`Failed to fetch file: ${response.status} ${response.statusText}`
			)
		}

		const contentLength = response.headers.get('content-length')
		if (contentLength && Number(contentLength) > 20 * 1024 * 1024) { // 20MB
			throw new Error('File too large (>20MB)')
		}

		const chunks: Buffer[] = []
		let total = 0
		const MAX = 25 * 1024 * 1024 // 25MB to be safe

		const reader = response.body?.getReader()
		if (!reader) throw new Error('No response body')

		while (true) {
			const { done, value } = await reader.read()
			if (done) break

			if (value) {
				total += value.length
				if (total > MAX) {
					throw new Error('Stream exceeded size limit')
				}
				chunks.push(Buffer.from(value))
			}
		}

		return Buffer.concat(chunks)
	} finally {
		clearTimeout(timeout)
	}
}
