/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import { registerCallbacks } from '@/handlers/callbacks/index.js';
import { registerCommands } from '@/handlers/commands/index.js';
import { env } from '@/utils/env.js';
import { Bot } from 'grammy';
import type { UserFromGetMe } from 'grammy/types';

export const bot = new Bot(env.botToken);

registerCommands(bot);
registerCallbacks(bot);

export async function startBot() {
  console.log('🚀 Starting bot...');
  await bot.init();

  // set webhook if enabled, otherwise start long polling
  const webhookEnabled = await setWebhook();
  if (webhookEnabled) {
    console.log(`✅ Webhook enabled.`);
  } else {
    console.log('Bot is running in long polling mode. Webhook is disabled.');

    await bot.start();
  }

  const botInfo = await bot.api.getMe();

  await onStart(botInfo, webhookEnabled);

  return;
}

async function onStart(botInfo: UserFromGetMe, webhookEnabled?: boolean) {
  console.log(`✅ Bot started as @${botInfo.username} \n`);

  // show bot info
  console.log(
    `👤 Bot info:\n` +
      ` - ID: ${botInfo.id}\n` +
      ` - Username: ${botInfo.username}\n` +
      ` - First name: ${botInfo.first_name}\n` +
      ` - Webhook URL: ${webhookEnabled ? '✓ Enabled' : '✕ Disabled'}\n`,
  );
}

async function setWebhook(): Promise<boolean> {
  let webhookEnabled = false;

  if (env.webhookEnabled) {
    const webhookUrl = new URL(`${env.baseUrl}/webhook/${env.botToken}`);

    webhookEnabled = await bot.api.setWebhook(webhookUrl.toString(), {
      secret_token: env.webhookSecret,
      drop_pending_updates: true,
    });
  } else {
    await bot.api.deleteWebhook();
  }

  return webhookEnabled;
}
