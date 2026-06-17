/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import type { MessageType } from '@prisma/client'
import bot, { BOT_TOKEN } from '../lib/bot.js'

export class TelegramService {
	async sendByType(
		chatId: number | string,
		type: MessageType,
		payload: string,
		extra = {}
	) {
		switch (type) {
			case 'TEXT':
				return bot.api.sendMessage(chatId, payload, extra)

			case 'PHOTO':
				return bot.api.sendPhoto(chatId, payload, extra)

			case 'VIDEO':
				return bot.api.sendVideo(chatId, payload, extra)

			case 'DOCUMENT':
				return bot.api.sendDocument(chatId, payload, extra)

			case 'AUDIO':
				return bot.api.sendAudio(chatId, payload, extra)

			case 'VOICE':
				return bot.api.sendVoice(chatId, payload, extra)

			case 'ANIMATION':
				return bot.api.sendAnimation(chatId, payload, extra)

			case 'STICKER':
				return bot.api.sendSticker(chatId, payload, extra)

			case 'VIDEO_NOTE':
				return bot.api.sendVideoNote(chatId, payload, extra)

			default:
				throw new Error(`Unsupported type: ${type}`)
		}
	}

	async downloadFile(
		fileId: string,
		maxSizeMB: number = 20,
		timeoutMs: number = 15000 // 15 seconds
	) {
		const controller = new AbortController()
		const timeout = setTimeout(() => controller.abort(), timeoutMs)

		try {
			// 1. Получаем file_path
			const file = await bot.api.getFile(fileId)

			const filePath = file.file_path
			if (!filePath) throw new Error('No file_path returned')

			const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`

			const size = file.file_size

			if (size && size > maxSizeMB * 1024 * 1024) {
				throw new Error('File too large')
			}

			// Download file to buffer
			const fileRes = await fetch(fileUrl, {
				signal: controller.signal,
			})

			if (!fileRes.ok) throw new Error('Failed to download file')

			const arrayBuffer = await fileRes.arrayBuffer()

			return {
				buffer: Buffer.from(arrayBuffer),
				filePath,
				size: size ? Number(size) : null,
			}
		} finally {
			clearTimeout(timeout)
		}
	}
}

export const tgService = new TelegramService()

export default tgService
