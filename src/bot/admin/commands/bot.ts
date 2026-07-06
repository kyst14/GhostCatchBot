/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import { type MyContext } from '@/bot/lib/bot.js'
import { GrammyError } from 'grammy'
import os from 'os'

export async function botCommand(ctx: MyContext) {
	const cpus = os.cpus()

	let updating = true

	const editMessage = async () => {
		const uptime = process.uptime()
		const mem = process.memoryUsage()

		await ctx.api.editMessageText(msg.chat.id, msg.message_id, text(uptime, mem), {
			parse_mode: 'HTML',
		})
	}

	const formatUptime = (seconds: number) => {
		const d = Math.floor(seconds / 86400)
		const h = Math.floor((seconds % 86400) / 3600)
		const m = Math.floor((seconds % 3600) / 60)
		const s = Math.floor(seconds % 60)

		return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${s}s`]
			.filter(Boolean)
			.join(' ')
	}

	const text = (uptime: number, mem: NodeJS.MemoryUsage) => `
🤖 <b>Bot Information</b>

🆔 ID: <code>${ctx.me.id}</code>
📛 Username: @${ctx.me.username}
📌 Name: ${ctx.me.first_name}

⚙️ <b>Process</b>
🟢 PID: <code>${process.pid}</code>
⏳ Uptime: ${formatUptime(uptime)}
🧠 RAM: ${(mem.rss / 1024 / 1024).toFixed(1)} MB
💾 Heap: ${(mem.heapUsed / 1024 / 1024).toFixed(1)} / ${(mem.heapTotal / 1024 / 1024).toFixed(1)} MB

🖥️ <b>System</b>
💻 OS: ${os.type()} ${os.release()}
🏗️ Architecture: ${os.arch()}
⚡ CPU: ${cpus[0]?.model}
🔥 Cores: ${cpus.length}
📈 Load: ${os
		.loadavg()
		.map(x => x.toFixed(2))
		.join(' / ')}

📡 Updating: ${updating ? '🟢' : '🔴'}
    `

	const msg = await ctx.reply(text(process.uptime(), process.memoryUsage()), {
		parse_mode: 'HTML',
	})

	async function updateLoop() {
		if (!updating) return

		try {
			await editMessage()
		} catch (e) {
			if (
				e instanceof GrammyError &&
				e.description.includes('message is not modified')
			) {
				return
			}

			throw e
		}

		if (updating) {
			setTimeout(updateLoop, 1000)
		}
	}

	const clear = async () => {
		updating = false
		await editMessage()
	}

	setTimeout(async () => {
		await clear()
	}, 20_000)

	updateLoop()
}
