/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Ghost Catch Bot is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Ghost Catch Bot. If not, see <https://www.gnu.org/licenses/>.
*/

import { env } from '@/utils/env.js';
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

// Generates a key based on userId and chatId
function deriveKey(userId: string | number | bigint, chatId: string | number | bigint): Buffer {
  const info = `${userId}:${chatId}`;
  return createHmac('sha256', env.encryptionKey).update(info).digest(); // 32 bytes
}

// Encrypts the text using AES-256-GCM
// Returns a string in the format: iv:authTag:ciphertext
export function encrypt(
  text: string,
  userId: string | number | bigint,
  chatId: string | number | bigint,
): string {
  const key = deriveKey(userId, chatId);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

  const authTag = cipher.getAuthTag();

  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

// Decrypts the encrypted data
export function decrypt(
  encryptedData: string,
  userId: string | number | bigint,
  chatId: string | number | bigint,
): string {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const ivHex = parts[0]!;
    const authTagHex = parts[1]!;
    const ciphertextHex = parts[2]!;

    const key = deriveKey(userId, chatId);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const ciphertext = Buffer.from(ciphertextHex, 'hex');

    const decipher = createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    return decrypted.toString('utf8');
  } catch {
    throw new Error('Failed to decrypt. Wrong key or corrupted data.');
  }
}

export const blindIndex = (v: string) =>
  createHmac('sha256', env.indexKey).update(v.trim().toLowerCase()).digest('hex');
