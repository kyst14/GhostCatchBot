import type { Role } from '@prisma/client'

export interface BotCommand {
	command: string
	description: string
	role: Role
	hidden?: boolean // Optional property to indicate if the command should be hidden from the help message
}

export const commandsList: BotCommand[] = [
	// * User commands

	{
		command: 'start',
		description: 'Get started with the bot.',
		role: 'USER',
	},
	{
		command: 'help',
		description: 'Show this help message.',
		role: 'USER',
	},
	{
		command: 'about',
		description: 'Show information about the bot and contacts.',
		role: 'USER',
	},
	{
		command: 'connect',
		description: 'Help connect the bot to your Business account.',
		role: 'USER',
	},
	{
		command: 'feedback',
		description: 'Provide feedback about the bot.',
		role: 'USER',
	},
	{
		command: 'stats',
		description: 'Show your message statistics.',
		role: 'USER',
	},

	//* Admin commands

	{
		command: 'user',
		description: 'View detailed information about a user.',
		role: 'ADMIN',
		hidden: true,
	},
	{
		command: 'users',
		description: 'Browse users with optional filters.',
		role: 'ADMIN',
		hidden: true,
	},
	{
		command: 'bot',
		description: 'Show bot statistics.',
		role: 'ADMIN',
		hidden: true,
	},
	{
		command: 'disconnect',
		description: 'Disconnect the bot from a Business account.',
		role: 'ADMIN',
		hidden: true,
	},
	{
		command: 'ban',
		description: 'Ban a user from using the bot.',
		role: 'ADMIN',
		hidden: true,
	},
	{
		command: 'unban',
		description: "Remove a user's ban.",
		role: 'ADMIN',
		hidden: true,
	},
	{
		command: 'broadcast',
		description: 'Send a broadcast message.',
		role: 'ADMIN',
		hidden: true,
	},
	{
		command: 'logs',
		description: 'View the administration activity log.',
		role: 'ADMIN',
		hidden: true,
	},

	// * Owner commands

	{
		command: 'admin',
		description: 'Promote a user to administrator.',
		role: 'OWNER',
		hidden: true,
	},
	{
		command: 'unadmin',
		description: 'Remove administrator privileges.',
		role: 'OWNER',
		hidden: true,
	},
	{
		command: 'admins',
		description: 'List all administrators.',
		role: 'OWNER',
		hidden: true,
	},
]

export const commands: Record<Role, BotCommand[]> = {
	USER: commandsList.filter(c => !c.hidden && c.role === 'USER'),

	ADMIN: commandsList.filter(c => !c.hidden && c.role === 'ADMIN'),

	OWNER: commandsList.filter(c => !c.hidden && c.role === 'OWNER'),
}
