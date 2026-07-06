import type { Role } from '@prisma/client'
import type { CommandMiddleware } from 'grammy'
import type { MyContext } from '../lib/bot.js'

// Commands
import { aboutCommand } from '../commands/about.js'
import { connectCommand } from '../commands/connect.js'
import { helpCommand } from '../commands/help.js'
import { startCommand } from '../commands/start.js'
import { statsCommand } from '../commands/stats.js'
import { botCommand } from '../admin/commands/bot.js'
import { createConversation } from '@grammyjs/conversations'
import { feedbackCommand } from '../commands/feedback.js'

export interface BaseBotCommand {
	name: string
	handler: CommandMiddleware<MyContext>
	description: string
	role: Role
	hidden?: boolean 
}

export type BotCommand =
	| BaseBotCommand
	| (Omit<BaseBotCommand, "handler"> & {
			hidden: true
			handler?: CommandMiddleware<MyContext>
	  })

export const commandsList: BotCommand[] = [
	// * User commands

	{
		name: 'start',
		handler: startCommand,
		description: 'Get started with the bot.',
		role: 'USER',
	},
	{
		name: 'help',
		handler: helpCommand,
		description: 'Show this help message.',
		role: 'USER',
	},
	{
		name: 'about',
		handler: aboutCommand,
		description: 'Show information about the bot and contacts.',
		role: 'USER',
	},
	{
		name: 'connect',
		handler: connectCommand,
		description: 'Help connect the bot to your Business account.',
		role: 'USER',
	},
	{
		name: 'feedback',
		handler: async (ctx, next) => {
			await createConversation(feedbackCommand)(ctx, next)
			await ctx.conversation.enter('feedbackCommand')
		},
		description: 'Provide feedback about the bot.',
		role: 'USER',
	},
	{
		name: 'stats',
		handler: statsCommand,
		description: 'Show your message statistics.',
		role: 'USER',
	},

	//* Admin commands

	{
		name: 'user',
		description: 'View detailed information about a user.',
		role: 'ADMIN',
		hidden: true,
	},
	{
		name: 'users',
		description: 'Browse users with optional filters.',
		role: 'ADMIN',
		hidden: true,
	},
	{
		name: 'bot',
		handler: botCommand,
		description: 'Show bot statistics.',
		role: 'ADMIN',
	},
	{
		name: 'disconnect',
		description: 'Disconnect the bot from a Business account.',
		role: 'ADMIN',
		hidden: true,
	},
	{
		name: 'ban',
		description: 'Ban a user from using the bot.',
		role: 'ADMIN',
		hidden: true,
	},
	{
		name: 'unban',
		description: "Remove a user's ban.",
		role: 'ADMIN',
		hidden: true,
	},
	{
		name: 'broadcast',
		description: 'Send a broadcast message.',
		role: 'ADMIN',
		hidden: true,
	},
	{
		name: 'logs',
		description: 'View the administration activity log.',
		role: 'ADMIN',
		hidden: true,
	},

	// * Owner commands

	{
		name: 'admin',
		description: 'Promote a user to administrator.',
		role: 'OWNER',
		hidden: true,
	},
	{
		name: 'unadmin',
		description: 'Remove administrator privileges.',
		role: 'OWNER',
		hidden: true,
	},
	{
		name: 'admins',
		description: 'List all administrators.',
		role: 'OWNER',
		hidden: true,
	},
]

export const commands: Record<Role, BaseBotCommand[]> = {
	USER: commandsList.filter(c => !c.hidden && c.role === 'USER') as BaseBotCommand[],

	ADMIN: commandsList.filter(c => !c.hidden && c.role === 'ADMIN') as BaseBotCommand[],

	OWNER: commandsList.filter(c => !c.hidden && c.role === 'OWNER') as BaseBotCommand[],
}
