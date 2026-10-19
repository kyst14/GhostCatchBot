/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Ghost Catch Bot is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Ghost Catch Bot. If not, see <https://www.gnu.org/licenses/>.
*/

import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env variable: ${name}`);
  }
  return value;
}

function optional(name: string, defaultValue: string): string {
  const value = process.env[name];
  if (!value) {
    return defaultValue;
  }
  return value;
}

export const env = {
  nodeEnv: optional('NODE_ENV', 'development'),
  isProd: process.env.NODE_ENV === 'production',

  isVercel: process.env.VERCEL === '1',

  botToken: required('BOT_TOKEN'),
  ownId: BigInt(required('OWN_ID')),

  port: Number(optional('PORT', '3000')),
  host: optional('HOST', '0.0.0.0'),

  webhookEnabled: optional('WEBHOOK_ENABLED', 'false').toLowerCase() === 'true',
  baseUrl: optional('BASE_URL', '').replace(/\/$/, ''),
  webhookSecret: optional('WEBHOOK_SECRET', ''),

  databaseUrl: required('DATABASE_URL'),
  encryptionKey: required('ENCRYPTION_KEY'),
} as const;

if (env.encryptionKey.length !== 64) {
  throw new Error('ENCRYPTION_KEY must be EXACTLY 64 characters');
}

if (env.webhookEnabled) {
  if (!env.baseUrl) throw new Error('BASE_URL is required when WEBHOOK_ENABLED=true');
  if (!env.webhookSecret) throw new Error('WEBHOOK_SECRET is required when WEBHOOK_ENABLED=true');
  if (env.webhookSecret.length < 32) {
    throw new Error('WEBHOOK_SECRET must be at least 32 characters');
  }
}

export default env;
