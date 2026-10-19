/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Ghost Catch Bot is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Ghost Catch Bot. If not, see <https://www.gnu.org/licenses/>.
*/

import type { MyContext } from '@/bot/context.js';
import type { Bot, CallbackQueryContext } from 'grammy';
import { helpConnectCallback } from './help-connect.js';

type CallbackHandler = (ctx: CallbackQueryContext<MyContext>) => unknown;

type Callback = {
  name: string;
  handler: CallbackHandler;
};

const callbacks: Callback[] = [{ name: 'help:connect', handler: helpConnectCallback }];

export function registerCallbacks(bot: Bot<MyContext>) {
  for (const { name, handler } of callbacks) {
    bot.callbackQuery(name, handler);
  }
}
