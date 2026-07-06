/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import 'dotenv/config'

import { conversations, createConversation } from '@grammyjs/conversations'
import { aboutCommand } from './commands/about.js'
import { connectCommand } from './commands/connect.js'
import { feedbackCommand } from './commands/feedback.js'
import { helpCommand } from './commands/help.js'
import { privacyCommand } from './commands/privacy.js'
import { startCommand } from './commands/start.js'
import { statsCommand } from './commands/stats.js'
import { handleBusinessConnection } from './handlers/businessConnection.js'
import { handleBusinessMessage } from './handlers/businessMessage.js'
import { handleDeletedMessage } from './handlers/deletedMessage.js'
import { handleEditedMessage } from './handlers/editedMessage.js'
import { handleFeedbackFlowCallback } from './handlers/feedbackFlow.js'
import bot, { isDev, OWN_ID, WEBHOOK } from './lib/bot.js'
import { businessMiddleware, mainMiddleware } from './middleware/middleware.js'
import { convoMiddleware } from './middleware/convoMiddleware.js'
import { session } from 'grammy'
import AdminComposer from './admin/middleware.js'

// Conversations

// Middleware
bot.use(session({ initial: () => ({}) }))
bot.use(mainMiddleware)
bot.use(conversations())

bot.on("message:entities:bot_command", convoMiddleware)

// Conversations
bot.use(createConversation(feedbackCommand))
bot.use(createConversation(handleFeedbackFlowCallback))

// Commands
bot.command('start', startCommand)
bot.command('help', helpCommand)
bot.command('connect', connectCommand)
bot.command('stats', statsCommand)
bot.command('about', aboutCommand)
bot.command('privacy', privacyCommand)
bot.command('feedback', async ctx => {
	await ctx.conversation.enter('feedbackCommand')
})
bot.callbackQuery(/^reply_to:(\d+)$/, async ctx => {
	await ctx.conversation.enter('handleFeedbackFlowCallback', ctx.match?.[1])
})

// Admin commands
bot.use(AdminComposer)

// Business
bot.use().filter(
	ctx =>
		ctx.has('business_connection') ||
		ctx.has('business_message') ||
		ctx.has('edited_business_message') ||
		ctx.has('deleted_business_messages'),
	businessMiddleware
)

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
		bot.api.sendMessage(OWN_ID, `❌ Uncaught Exception: ${err.message}`)
		console.error('❌ Uncaught Exception:', err)
		process.exit(1)
	} else {
		bot.api.sendMessage(OWN_ID, `❌ Uncaught Exception: ${err.message}`)
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
