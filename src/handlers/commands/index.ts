/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import type { MyContext } from '@/bot/context.js';
import type { Bot, CommandContext } from 'grammy';
import { startCommand } from './start.js';
import { connectCommand } from './connect.js';

type CommandHandler = (ctx: CommandContext<MyContext>) => unknown;

type Command = {
  name: string;
  handler: CommandHandler;
  description?: string;
  hide?: boolean;
};

const commands: Command[] = [
  { name: 'start', description: 'Start/Restart the bot', handler: startCommand },
  {
    name: 'connect',
    description: 'Help to connect the bot to your Business account',
    handler: connectCommand,
  },
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
