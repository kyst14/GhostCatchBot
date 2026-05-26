import 'dotenv/config'
import { Bot } from 'grammy'

// Bot token
const BOT_TOKEN = process.env.BOT_TOKEN
const PRIVATE_CHAT_ID = process.env.PRIVATE_CHAT_ID

if (!BOT_TOKEN) {
	throw new Error('BOT_TOKEN is not defined')
} else if (!PRIVATE_CHAT_ID) {
	throw new Error('PRIVATE_CHAT_ID is not defined')
}

const messageCache = new Map<string, any>() // key = business_connection_id + message_id

const bot = new Bot(BOT_TOKEN)

bot.command('start', async ctx => {
	await ctx.reply(
		'👋 Привет, я Ghost Catcher! Подключи меня к Business аккаунту и я заработаю!'
	)
})

// Ловим подключение бота к Business аккаунту
bot.on('business_connection', async ctx => {
	const conn = ctx.businessConnection
	console.log(
		`✅ Business Connection: ${conn.id} | User: ${conn.user.first_name}(@${conn.user.username})`
	)

	
	// Отправляем приветственное сообщение 
	if (conn.is_enabled) {
		await ctx.api.sendMessage(
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
bot.on('business_message', async ctx => {
	const msg = ctx.businessMessage!
	const connId = ctx.businessConnectionId!

	console.log(`📨 Новое сообщение от ${msg.from?.first_name}: ${msg.text}`)

	// Save new message
	const key = `${connId}:${msg.message_id}`
	messageCache.set(key, { ...msg, timestamp: Date.now() })
})

// Message edited
bot.on('edited_business_message', async ctx => {
	const msg = ctx.editedBusinessMessage!
	const connId = ctx.businessConnectionId!

	const key = `${connId}:${msg.message_id}`
	const original = messageCache.get(key)

	console.log(`✏️ Сообщение отредактировано!`)

	if (original) {
		await ctx.api.sendMessage(
			PRIVATE_CHAT_ID,
			`🔄 <b>Сообщение было отредактировано</b>\n\n` +
				`<b>Оригинал:</b>\n${original.text || 'Нет текста'}\n\n` +
				`<b>Новая версия:</b>\n${msg.text || 'Нет текста'}`,
			{ parse_mode: 'HTML', business_connection_id: connId }
		)
	}
})

// Message deleted
bot.on('deleted_business_messages', async ctx => {
	const deleted = ctx.deletedBusinessMessages!
	const connId = deleted.business_connection_id

	console.log(`🗑 Удалено сообщений: ${deleted.message_ids.length}`)

	for (const msgId of deleted.message_ids) {
		const key = `${connId}:${msgId}`
		const original = messageCache.get(key)

		if (original) {
			await bot.api.sendMessage(
				PRIVATE_CHAT_ID,
				`🗑 <b>Сообщение было удалено</b>\n\n` +
					`<b>Автор:</b> ${original.from?.first_name}\n` +
					`<b>Оригинал:</b>\n${original.text || '[Медиа/файл]'}\n` +
					`<i>Удалено в ${new Date().toLocaleTimeString()}</i>`,
				{
					parse_mode: 'HTML',
				}
			)

			messageCache.delete(key)
		}
	}
})

// Save media
bot.on(['business_message:photo', 'business_message:video'], async ctx => {
	const msg = ctx.businessMessage
	if (!msg) return

	const connId = ctx.businessConnectionId!

	if (msg.has_protected_content) {
		console.log('🔒 Обнаружено защищённое / одноразовое медиа')

		try {
			await ctx.api.copyMessage(PRIVATE_CHAT_ID, msg.chat.id, msg.message_id, {
				caption: msg.caption
					? `🔒 Одноразовое медиа\n\n${msg.caption}`
					: '🔒 Одноразовое медиа',
				parse_mode: 'HTML',
			})
		} catch (error: any) {
			console.error('❌ Не удалось скопировать медиа:', error.message)

			// Вариант 2: если copyMessage тоже не сработает — просто уведомление
			await ctx.api.sendMessage(
				PRIVATE_CHAT_ID,
				`⚠️ Не удалось сохранить одноразовое медиа\n` +
					`Chat ID: ${msg.chat.id}\n` +
					`Message ID: ${msg.message_id}\n` +
					`Business Connection: ${connId}`,
				{ parse_mode: 'HTML' }
			)
		}
	}
})

bot.start()
console.log('🤖 Business Logger Bot запущен...')
