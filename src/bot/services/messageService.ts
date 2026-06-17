import prisma from '@/db/db.js'
import { encryptText } from '@/utils/encryption.js'
import type { MessageType } from '@prisma/client'
import type { Context } from 'grammy'
import type { Message } from 'grammy/types'

interface Media<Type extends string = MessageType> {
	type: Type
	content: string
}

class messageService {
	async saveBusinessMessage(ctx: Context, msg: Message, media: Media) {
		const encrypted =
			media.type === 'TEXT'
				? encryptText(media.content)
				: encryptText(
						JSON.stringify({
							fileId: media.content,
							caption: msg.caption || '',
						})
					)

		const ownId = await ctx.getBusinessConnection().then(conn => conn.user.id)
		const createdAt = new Date(msg.date * 1000)

		return await prisma.message.create({
			data: {
				tgId: msg.message_id,
				type: media.type,
				content: encrypted,
				senderName: encryptText(
					msg.from?.username || msg.from?.first_name || 'Unknown'
				),
				createdAt,
				expiresAt: new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days

				chat: {
					connect: {
						tgId_ownId: {
							ownId,
							tgId: msg.chat.id,
						},
					},
				},
				own: {
					connect: {
						id: ownId,
					},
				},
			},
		})
	}

	extractMedia(msg: Message): Media | null {
		if (msg.photo) {
			const photo = msg.photo.at(-1)!
			return {
				type: 'PHOTO',
				content: photo.file_id,
			}
		}

		if (msg.video) {
			return {
				type: 'VIDEO',
				content: msg.video.file_id,
			}
		}

		if (msg.document) {
			return {
				type: 'DOCUMENT',
				content: msg.document.file_id,
			}
		}

		if (msg.audio) {
			return {
				type: 'AUDIO',
				content: msg.audio.file_id,
			}
		}

		if (msg.voice) {
			return {
				type: 'VOICE',
				content: msg.voice.file_id,
			}
		}

		if (msg.animation) {
			return {
				type: 'ANIMATION',
				content: msg.animation.file_id,
			}
		}

		if (msg.sticker) {
			return {
				type: 'STICKER',
				content: msg.sticker.file_id,
			}
		}

		if (msg.video_note) {
			return {
				type: 'VIDEO_NOTE',
				content: msg.video_note.file_id,
			}
		}

		if (msg.text) {
			return {
				type: 'TEXT',
				content: msg.text,
			}
		}

		return null
	}

	async touchMessage(ctx: Context) {
		if (!ctx.businessMessage) return
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

		return await prisma.message.updateMany({
			where: {
				ownId: await ctx.getBusinessConnection().then(conn => conn.user.id),
				tgId: ctx.businessMessage?.message_id,
				tgChatId: ctx.businessMessage?.chat.id,
			},
			data: {
				lastAccessedAt: new Date(),
				expiresAt,
			},
		})
	}

	async isOwn(ctx: Context): Promise<boolean> {
		const conn = await ctx.getBusinessConnection()
		const user = conn.user

		if (!user) return false
		return false // user.id === ctx.businessMessage?.from?.id
	}
}

export const msgService = new messageService()
export default msgService
