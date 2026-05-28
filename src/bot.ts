import 'dotenv/config'
import { Bot, Context } from 'grammy'
import type { BusinessConnection } from 'grammy/types'
import prisma from './db.js'
import { decryptText, encryptText } from './encryption.js'

const isDev = process.env.NODE_ENV !== 'production'

// Bot config
const BOT_TOKEN = process.env.BOT_TOKEN
const ADMIN_ID = process.env.ADMIN_ID
export const WEBHOOK: URL | null = !isDev
	? new URL(process.env.WEBHOOK_SECRET!, process.env.BASE_URL!)
	: null

if (!BOT_TOKEN) {
	throw new Error('BOT_TOKEN is not defined')
} else if (!ADMIN_ID) {
	throw new Error('ADMIN_ID is not defined')
}

const bot = new Bot(BOT_TOKEN)

bot.command('start', async ctx => {
	return await ctx.reply(
		'👋 Привет, я <b>Ghost Catcher</b>! Подключи меня к Business аккаунту и я заработаю!',
		{ parse_mode: 'HTML' }
	)
})

bot.use(async (ctx, next) => {
	const conn = ctx.businessConnection
	await connectUser(conn)
	await connectChat(ctx)
	next()
})

// Ловим подключение бота к Business аккаунту
bot.on('business_connection', async ctx => {
	const conn = ctx.businessConnection

	// Send welcome message
	if (conn.is_enabled) {
		return await ctx.api.sendMessage(
			ctx.businessConnection.user.id,
			`👋 Привет, ${conn.user.first_name}!\n` +
				`Вы подключились к Business аккаунту.\n` +
				`Теперь вы можете:` +
				`\n\n` +
				`- Просматривать и удалять сообщения в Business чатах` +
				`\n` +
				`- Сохранять одноразовое медиа в личном чате`,
			{ parse_mode: 'HTML' }
		)
	} else {
		// Disconnect
	}
})

// Новое сообщение в Business чате
bot.on('business_message:text').filter(
	async ctx => {
		return !(await isOwn(ctx))
	},
	async ctx => {
		const msg = ctx.businessMessage!

		const { id: ownId } = (await prisma.user.findFirst({
			where: {
				connId: ctx.businessConnectionId!,
			},
			select: {
				id: true,
			},
		}))!

		const createdAt = new Date(msg.date * 1000)

		// Save new message
		await prisma.message.create({
			data: {
				tgId: msg.message_id,
				type: 'TEXT',
				content: encryptText(msg.text || '', {
					id: msg.message_id,
					createdAt: createdAt,
				}),
				createdAt: createdAt,
				chat: {
					connect: {
						id: msg.chat.id,
					},
				},
				senderName: msg.from.username || msg.from.first_name,
				own: {
					connect: { id: ownId },
				},
			},
		})

		return;
	}
)

// Message edited
bot.on('edited_business_message', async ctx => {
	const msg = ctx.editedBusinessMessage!

	const original = await prisma.message.findFirst({
		where: {
			tgId: msg.message_id,
		},
	})
	if (!original) return

	const decrypted = decryptText(original.content, {
		id: original.tgId,
		createdAt: original.createdAt,
	})
	if (!decrypted) return

	if (original) {
		await bot.api.sendMessage(
			original.ownId.toString(),
			`📝 <b>@${original.senderName} изменил(а) сообщение: </b>\n\n` +
				`<b>Старое:</b>` +
				`<blockquote>${decrypted}</blockquote>\n\n`+
				`<b>Новое:</b> `+
				`<blockquote>${msg.text}</blockquote>\n`,
			{
				parse_mode: 'HTML',
			}
		)

		await prisma.message.update({
			where: {
				id: original.id,
			},
			data: {
				content: encryptText(msg.text!, {
					id: msg.message_id,
					createdAt: new Date(msg.date * 1000),
				}),
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
		if (!original) return

		await bot.api.sendMessage(
			original.ownId.toString(),
			`❌ <b>@${original.senderName} удалил(а) сообщение: </b>\n\n` +
				`<b>Оригинал:</b>` +
				`<blockquote>${decryptText(original.content, {
						id: original.tgId,
						createdAt: original.createdAt,
					}).trim()}
				</blockquote>`,
			{
				parse_mode: 'HTML',
			}
		)
	}

	return
})

bot.catch(err => {
	if (isDev) {
		console.error('❌ Ошибка:', err)
		process.exit(1)
	} else {
		bot.api.sendMessage(ADMIN_ID, `❌ Ошибка: ${err.message}`)
	}
})

export async function startBot() {
	console.log('🚀 Starting bot...')

	await bot.init()
	if (WEBHOOK) {
		await bot.api.setWebhook(WEBHOOK.toString())
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
			` - Webhook: ${WEBHOOK}\n`
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
		},
	})
}

async function isOwn(ctx: Context): Promise<boolean> {
	const conn = await ctx.getBusinessConnection()
	const user = conn.user

	if (!user) return false
	return false //user.id === ctx.businessMessage?.from?.id
}
