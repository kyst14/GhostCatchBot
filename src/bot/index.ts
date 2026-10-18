/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import { registerCommands } from '@/handlers/commands/index.js';
import { env } from '@/utils/env.js';
import { Bot } from 'grammy';

const bot = new Bot(env.botToken);

registerCommands(bot);

export async function startBot() {
  console.log('🚀 Starting bot...');
  await bot.init();

  await bot.start({
    onStart: (botInfo) => {
      console.log(`✅ Bot started as @${botInfo.username} \n`);

      // show bot info
      console.log(
        `👤 Bot info:\n` +
          ` - ID: ${botInfo.id}\n` +
          ` - Username: ${botInfo.username}\n` +
          ` - First name: ${botInfo.first_name}\n`,
      );
    },
  });

  return;
}
