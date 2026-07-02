/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import { InlineKeyboard } from 'grammy'
import { OWN_ID, type MyContext, type MyConversation } from '../lib/bot.js'

export async function feedbackCommand(conversation: MyConversation, ctx: MyContext) {
	await ctx.reply('📨 Write your feedback. It will be sent to the admin. \nSend /cancel to cancel.')

	const ctx0 = await conversation.wait()

    if (ctx0.hasCommand("cancel")) {
        await ctx0.reply("🚫 Feedback cancelled.")
        return
    }

    if (!ctx0.message) return

    await ctx.api.sendMessage(
        OWN_ID,
        `📨 <b>Feedback from user @${ctx.from?.username} (${ctx.from?.id})</b>\n\n`,
        {
            parse_mode: "HTML",
        }
    )

    await ctx.api.copyMessage(
        OWN_ID,
        ctx.from!.id,
        ctx0.message.message_id,
        {
            reply_markup: new InlineKeyboard().text(
                "✏️ Reply",
                `reply_to:${ctx.from!.id}`
            ),
        }
    )

    await ctx0.reply("✅ Thanks for your feedback!")
}
