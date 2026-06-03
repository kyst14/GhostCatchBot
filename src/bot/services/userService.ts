import prisma from '@/db/db.js'
import type { BusinessConnection } from 'grammy/types'

export class UserService {
	async connectUser(conn: BusinessConnection | undefined) {
		if (!conn) return
		return await prisma.user.upsert({
			where: {
				id: conn.user.id,
			},
			update: {
				username: conn.user.username || conn.user.first_name,
				connId: conn.id,
			},
			create: {
				id: conn.user.id,
				username: conn.user.username || conn.user.first_name,
				connId: conn.id,
			},
		})
	}
}

export const userService = new UserService()
export default userService
