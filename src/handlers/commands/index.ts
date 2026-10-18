import type { MyContext } from '@/bot/context.js';
import type { Bot, CommandContext } from 'grammy';
import { startCommand } from './start.js';

type CommandHandler = (ctx: CommandContext<MyContext>) => unknown;

type Command = {
  name: string;
  handler: CommandHandler;
  description?: string;
  hide?: boolean;
};

const commands: Command[] = [
  { name: 'start', description: 'Start/Restart the bot', handler: startCommand },
];

export function registerCommands(bot: Bot<MyContext>) {
  for (const { name, handler } of commands) {
    bot.command(name, handler);
  }

  bot.api.setMyCommands(
    commands
      .filter((command) => !command.hide)
      .map((command) => ({ command: command.name, description: command.description || '' })),
  );
}
