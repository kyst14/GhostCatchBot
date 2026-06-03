import prisma from '@/lib/db.js'
import type { MessageType } from '@prisma/client'
import 'dotenv/config'
import { Bot, Context, InlineKeyboard, InputFile } from 'grammy'
import type { BusinessConnection, Message, ParseMode } from 'grammy/types'
import { escape } from 'html-escaper'
import { decryptBuffer, decryptText, encryptText } from './encryption.js'

const isDev = process.env.NODE_ENV !== 'production'

// Bot config
const BOT_TOKEN = process.env.BOT_TOKEN
const ADMIN_ID = Number(process.env.ADMIN_ID!)
export const WEBHOOK: URL | null =
	!isDev && process.env.WEBHOOK_SECRET && process.env.BASE_URL
		? new URL(process.env.WEBHOOK_SECRET, process.env.BASE_URL)
		: null

if (!BOT_TOKEN) {
	throw new Error('BOT_TOKEN is not defined')
} else if (!ADMIN_ID) {
	throw new Error('ADMIN_ID is not defined')
}

const bot = new Bot(BOT_TOKEN)

bot.command('start', async ctx => {
	const chatId = ctx.match

	if (chatId && ctx.message) {
		const user = await prisma.user.findUnique({
			where: {
				id: ctx.message?.from.id,
			},
		})

		if (user) {
			const chat = await prisma.chat.findUnique({
				where: {
					id: Number(chatId.replace('bizChat', '')),
				},
			})

			if (!chat) {
				return await ctx.reply(`🚫 Chat not found.`)
			}

			const msg = await prisma.message.findFirst({
				where: {
					chatId: chat.id,
				},
				orderBy: {
					createdAt: 'desc', // Get the latest message in the chat to extract sender name
				},
				select: {
					senderName: true,
				},
			})

			const username = decryptText(msg?.senderName || '') || 'Unknown'

			return await ctx.reply(
				`Chat with @${username}.\n\n` +
					`Statistics for this chat:\n` +
					`- Deleted messages: ${chat.messagesDeleted}\n` +
					`- Edited messages: ${chat.messagesEdited}\n` +
					`- Protected messages: ${chat.messagesProtected}\n\n`
			)
		} else {
			return await ctx.reply(`🚫 Chat not found.`)
		}
	}

	await ctx.reply(
		`👋 Hello! I'm a bot that helps you save and view deleted and edited messages from your Telegram account.\n\n` +
			`To get started, please use /help command to see available commands and features.`
	)

	await ctx.replyWithSticker(
		'CAACAgQAAxkBAAEqCt5qH_ZRrr6naLpYVaVaar7KYL1umAACChAAAkKv4FIZCCMqEYiOcjsE'
	)

	await ctx.reply(
		`Using this bot you agree to our <b>Privacy Policy</b>. You can read it here:`,
		{
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: 'Privacy Policy',
							url: 'https://telegra.ph/Privacy-Policy-for-Ghost-Catch-Bot-06-02',
						},
					],
				],
			},
		}
	)
})

bot.command('help', async ctx => {
	return await ctx.reply(
		`I'm a bot that helps you save and view deleted and edited messages from your Telegram account.\n\n` +
			`Here are the available commands:\n` +
			`- /start: Get started with the bot\n` +
			`- /help: Show this help message\n` +
			`- /connect: Help connect the bot to your Business account\n` +
			`- /feedback: Provide feedback about the bot\n` +
			`- /stats: Show your message statistics\n\n` +
			`Features:\n` +
			`- View deleted messages in Business chats\n` +
			`- View edited messages in Business chats\n` +
			`- Save ephemeral media in private chats (reply to a protected message with media to save it)`
	)
})

bot.command('connect', async ctx => {
	return await ctx.reply(
		`❓ Connect the bot to your Business account:\n\n
			1. Click "🔌 Connect" button
			2. Choose "Chat automation" and write in the input field: @${ctx.me?.username}`,
		{
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: '🔌 Connect',
							url: `tg://settings/edit/`,
						},
					],
				],
			},
			parse_mode: 'HTML',
		}
	)
})

bot.command('stats', async ctx => {
	if (!ctx.from?.id) return
	const user = await prisma.user.findUnique({
		where: {
			id: ctx.from.id,
		},
	})

	if (!user) {
		return await ctx.reply(`🚫 User not found.`)
	}

	await ctx.reply(
		`📊 Statistics for this chat:\n` +
			`- Deleted messages: ${user.messagesDeleted} 🗑️\n` +
			`- Edited messages: ${user.messagesEdited} 📝\n` +
			`- Saved protected messages: ${user.messagesProtected} 🔒\n\n` +
			`📋 Total: ${user.messagesDeleted + user.messagesEdited + user.messagesProtected}`
	)

	await ctx.replyWithSticker(
		'CAACAgQAAxkBAAEqCylqH_4jB4giFAeacWBOkYGulkcMZAACFw8AAlP_iVNxK01zPrG2XzsE'
	)

	return await ctx.reply(
		`To view statistics for a specific chat, open the chat, above click settings button and then click "Manage bot".`
	)
})

bot.command('feedback', async ctx => {
	return await ctx.reply(
		`📨 Write your feedback here replying to this message. It will be sent to the admin.`,
		{
			reply_markup: {
				force_reply: true,
				input_field_placeholder: 'Write your feedback...',
			},
		}
	)
})

bot.callbackQuery(/^reply_to:(\d+)$/, async ctx => {
	const userId = ctx.match[1]

	await ctx.answerCallbackQuery()
	await ctx.reply(
		`📨 Write your answer (ID: ${userId}). It will be sent to the user.`,
		{
			reply_markup: {
				force_reply: true,
				input_field_placeholder: 'Write your answer...',
			},
		}
	)
})

bot.on('message', async (ctx, next) => {
	const replyTo = ctx.message.reply_to_message

	if (!replyTo) return await next()

	const replyText = replyTo.text || ''

	// --- ADMIN ---
	if (ctx.from.id === ADMIN_ID) {
		const match = replyText.match(/ID:\s*(\d+)/)

		if (match) {
			const userId = match[1] || ''

			try {
				await ctx.api.sendMessage(userId, `📨 <b>Message from admin:</b>`, {
					parse_mode: 'HTML',
				})
				await ctx.api.copyMessage(
					userId,
					ctx.message.chat.id,
					ctx.message.message_id
				)
				return await ctx.reply('✅ Reply sended successfully to the user!')
			} catch (err) {
				return await ctx.reply(
					'❌ Failed to send reply to the user. Probably the user has blocked the bot.'
				)
			}
		}
	}

	// --- USER FEEDBACK ---
	const isOfficialFeedbackRequest = replyText.includes(
		'Write your feedback here replying to this message'
	)

	if (isOfficialFeedbackRequest) {
		try {
			const keyboard = new InlineKeyboard().text(
				'✏️ Reply',
				`reply_to:${ctx.from.id}`
			)

			await ctx.api.sendMessage(
				ADMIN_ID,
				`📨 <b>Message from @${ctx.from.username || ctx.from.first_name}:</b>`,
				{ parse_mode: 'HTML' }
			)

			await ctx.api.copyMessage(
				ADMIN_ID,
				ctx.message.chat.id,
				ctx.message.message_id,
				{ reply_markup: keyboard }
			)

			ctx.react('❤')

			return await ctx.reply('👍 Thank you! Your message was sended to admin!')
		} catch (err) {
			return await ctx.reply('❌ Failed to send message to the admin.')
		}
	}
})

bot.use().filter(
	async ctx => {
		return (
			!!ctx.businessConnection ||
			!!ctx.businessMessage ||
			!!ctx.update?.business_connection
		)
	},
	async (ctx, next) => {
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

		return await next()
	}
)

// Catch Business connection
bot.on('business_connection', async ctx => {
	const conn = ctx.businessConnection

	// Send welcome message
	if (conn.is_enabled) {
		await ctx.api.sendMessage(
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
		return await ctx.api.sendSticker(
			ctx.businessConnection.user.id,
			'CAACAgQAAxkBAAEqCvBqH_huX7GcaLHxwJogo9VstEYS6QACexEAApr_6FEZmokItQ_wPDsE'
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

		const { type, content } = extractMedia(msg) || {}

		if (!type || !content ) {
			return
		}

		let encrypted = ''

		if (type === 'TEXT') {
			encrypted = encryptText(content)
		} else {
			const fileId = encryptText(content)
			const caption = encryptText(msg.caption || msg.text || '')
			encrypted = JSON.stringify({ fileId, caption })
		}

		// Save messages to DB
		await prisma.message.create({
			data: {
				tgId: msg.message_id,
				type: type,
				content: encrypted,
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

		const { type } = extractMedia(msg) || {}

		if (type === 'PHOTO' || type === 'VIDEO') {
			const file = msg.photo?.at(-1) || msg.video // Get the highest resolution photo
			if (!file) return
			const { buffer } = await downloadTelegramFile(file.file_id).catch(() => {
				ctx.api.sendMessage(
					ownId.toString(),
					`⚠️ Failed to fetch the file. It might be too large or unavailable.`
				)
				return { buffer: undefined }
			})
			if (!buffer) return

			await ctx.api.sendPhoto(ownId.toString(), new InputFile(buffer), {
				caption: captionText ?? '',
			})
		}

		incrementProtected(ownId, msg.chat.id)
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
				`Timestamp: ${original.createdAt.toLocaleString("ru-RU")}`,
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

	incrementEdited(original.ownId, msg.chat.id)

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
					`Timestamp: ${original.createdAt.toLocaleString("ru-RU")}`,
				{
					parse_mode: 'HTML',
				}
			)
		} else {
			const encoded = JSON.parse(original.content)

			const fileId = decryptText(encoded.fileId || '')
			const captionText = decryptText(encoded.caption || '')

			if (!fileId) continue
			
			await bot.api.sendMessage(
				original.ownId.toString(),
				`❌ <b>@${senderName} deleted message: </b>\n\n` +
				`Timestamp: ${original.createdAt.toLocaleString("ru-RU")}`,
				{
					parse_mode: 'HTML',
				}
			)

			await sendByType(original.ownId.toString(), original.type, fileId, {
				caption: captionText
			})
		}

		incrementDeleted(original.ownId, original.chatId)

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

async function connectChat(ctx: Context) {
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

async function isOwn(ctx: Context): Promise<boolean> {
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

async function downloadTelegramFile(
	fileId: string,
	maxSizeMB: number = 20,
	timeoutMs: number = 15000 // 15 seconds
) {
	const controller = new AbortController()
	const timeout = setTimeout(() => controller.abort(), timeoutMs)

	try {
		// 1. Получаем file_path
		const file = await bot.api.getFile(fileId)

		const filePath = file.file_path
		if (!filePath) throw new Error('No file_path returned')

		const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`

		const size = file.file_size

		if (size && size > maxSizeMB * 1024 * 1024) {
			throw new Error('File too large')
		}

		// Download file to buffer
		const fileRes = await fetch(fileUrl, {
			signal: controller.signal,
		})

		if (!fileRes.ok) throw new Error('Failed to download file')

		const arrayBuffer = await fileRes.arrayBuffer()

		return {
			buffer: Buffer.from(arrayBuffer),
			filePath,
			size: size ? Number(size) : null,
		}
	} finally {
		clearTimeout(timeout)
	}
}

interface Media<Type extends string = MessageType> {
	type: Type
	content: string
}

function extractMedia(msg: Message): Media | null {
	if (msg.photo) {
		const photo = msg.photo.at(-1)!
		return {
			type: 'PHOTO',
			content: photo.file_id,
		}
	}

	if (msg.video) {
		return {
			type: 'VIDEO',
			content: msg.video.file_id,
		}
	}

	if (msg.document) {
		return {
			type: 'DOCUMENT',
			content: msg.document.file_id,
		}
	}

	if (msg.audio) {
		return {
			type: 'AUDIO',
			content: msg.audio.file_id,
		}
	}

	if (msg.voice) {
		return {
			type: 'VOICE',
			content: msg.voice.file_id,
		}
	}

	if (msg.animation) {
		return {
			type: 'ANIMATION',
			content: msg.animation.file_id,
		}
	}

	if (msg.sticker) {
		return {
			type: 'STICKER',
			content: msg.sticker.file_id,
		}
	}

	if (msg.video_note) {
		return {
			type: 'VIDEO_NOTE',
			content: msg.video_note.file_id,
		}
	}

	if (msg.text) {
		return {
			type: 'TEXT',
			content: msg.text,
		}
	}

	return null
}

export async function sendByType(chatId: number | string, type: MessageType, payload: string, extra = {}) {
  switch (type) {
    case "TEXT":
      return bot.api.sendMessage(chatId, payload, extra);

    case "PHOTO":
      return bot.api.sendPhoto(chatId, payload, extra);

    case "VIDEO":
      return bot.api.sendVideo(chatId, payload, extra);

    case "DOCUMENT":
      return bot.api.sendDocument(chatId, payload, extra);

    case "AUDIO":
      return bot.api.sendAudio(chatId, payload, extra);

    case "VOICE":
      return bot.api.sendVoice(chatId, payload, extra);

    case "ANIMATION":
      return bot.api.sendAnimation(chatId, payload, extra);

    case "STICKER":
      return bot.api.sendSticker(chatId, payload, extra);

    case "VIDEO_NOTE":
      return bot.api.sendVideoNote(chatId, payload, extra);

    default:
      throw new Error(`Unsupported type: ${type}`);
  }
}

// Statistics
async function incrementDeleted(userId: number | bigint, chatId: number | bigint) {
	await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			messagesDeleted: {
				increment: 1,
			},
		},
	})

	await prisma.chat.update({
		where: {
			id: chatId,
		},
		data: {
			messagesDeleted: {
				increment: 1,
			},
		},
	})

	return
}

async function incrementEdited(userId: number | bigint, chatId: number | bigint) {
	await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			messagesEdited: {
				increment: 1,
			},
		},
	})

	await prisma.chat.update({
		where: {
			id: chatId,
		},
		data: {
			messagesEdited: {
				increment: 1,
			},
		},
	})

	return
}

async function incrementProtected(userId: number | bigint, chatId: number | bigint) {
	await prisma.user.update({
		where: {
			id: userId,
		},
		data: {
			messagesProtected: {
				increment: 1,
			},
		},
	})

	await prisma.chat.update({
		where: {
			id: chatId,
		},
		data: {
			messagesProtected: {
				increment: 1,
			},
		},
	})

	return
}
