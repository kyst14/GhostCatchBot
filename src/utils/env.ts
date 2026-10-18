/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',

  botToken: required('BOT_TOKEN'),
  ownId: BigInt(required('OWN_ID')),

  port: Number(process.env.PORT ?? 3000),
  host: process.env.HOST ?? '0.0.0.0',

  baseUrl: process.env.BASE_URL ?? '',
  webhookUrl: process.env.WEBHOOK_URL ?? '',
  webhookSecret: process.env.WEBHOOK_SECRET ?? '',

  databaseUrl: required('DATABASE_URL'),
  encryptionKey: required('ENCRYPTION_KEY'),
} as const;

if (env.encryptionKey.length < 32) {
  throw new Error('ENCRYPTION_KEY must be at least 32 characters');
}
