import 'dotenv/config'

import { connectCommand } from './commands/connect.js'
import { feedbackCommand } from './commands/feedback.js'
import { helpCommand } from './commands/help.js'
import { startCommand } from './commands/start.js'
import { statsCommand } from './commands/stats.js'
import { handleBusinessConnection } from './handlers/businessConnection.js'
import { handleBusinessMessage } from './handlers/businessMessage.js'
import { handleDeletedMessage } from './handlers/deletedMessage.js'
import { handleEditedMessage } from './handlers/editedMessage.js'
import {
	handleFeedbackFlow,
	handleFeedbackFlowCallback,
} from './handlers/feedbackFlow.js'
import bot, { ADMIN_ID, isDev, WEBHOOK } from './lib/bot.js'
import { businessMiddleware } from './middleware/businessContext.js'
import { aboutCommand } from './commands/about.js'

bot.command('start', startCommand)
bot.command('help', helpCommand)
bot.command('connect', connectCommand)
bot.command('stats', statsCommand)
bot.command('about', aboutCommand)

// Feedback
bot.command('feedback', feedbackCommand)
bot.callbackQuery(/^reply_to:(\d+)$/, handleFeedbackFlowCallback)
bot.on('message', handleFeedbackFlow)

bot.use(businessMiddleware)

// Catch Business connection
bot.on('business_connection', handleBusinessConnection)

// Message in Business чате
bot.on('business_message', handleBusinessMessage)

// Message edited
bot.on('edited_business_message:text', handleEditedMessage)

// Message deleted
bot.on('deleted_business_messages', handleDeletedMessage)

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
