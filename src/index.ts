/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import { bot, startBot } from '@/bot/index.js';
import { startCleanupJob } from '@/utils/cron.js';
import env from '@/utils/env.js';
import express from 'express';
import { webhookCallback } from 'grammy';
import path from 'path';

const app = express();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = process.env.HOST || '0.0.0.0';

const rootDir = process.cwd();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).sendFile(path.join(rootDir, 'src/site/index.html'));
});

app.get('/health', (req, res) => {
  res.status(200).json({
    server: {
      ok: true,
      node: process.version,
      uptime: process.uptime(),
    },
  });
});

if (env.webhookEnabled) {
  app.use(
    `/webhook/${env.botToken}`,
    webhookCallback(bot, 'express', {
      secretToken: env.webhookSecret,
    }),
  );
}

if (env.isVercel) {
  console.log('Running on Vercel, starting bot...');

  startBot();
} else { 
  // Start the server
  app.listen(PORT, HOST, async () => {
    console.log('🚀 Server started: ');

    console.log('http://localhost:' + PORT);

    startCleanupJob();
    await startBot();
  });
}

export default app;