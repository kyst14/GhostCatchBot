/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import type { Context } from 'grammy'

function isUrlValid(url: string) {
	try {
		new URL(url)
		return true
	} catch {
		return false
	}
}

const rawLinkPrivacy = process.env.LINK_PRIVACY

const linkPrivacy =
	rawLinkPrivacy && isUrlValid(rawLinkPrivacy) ? new URL(rawLinkPrivacy) : null

if (!linkPrivacy) {
	console.warn('❌ LINK_PRIVACY is not defined or is not a valid URL. Ignoring...')
}

export async function privacyCommand(ctx: Context) {
	if (!linkPrivacy) {
		return ctx.reply('Privacy Policy is not configured yet.')
	}

	return ctx.reply(
		`🔒 Privacy matters.\n\n` +
			`This bot may process some data to function properly. We keep things minimal and safe.\n\n` +
			`Check our <b>Privacy Policy</b> for full details.`,
		{
			parse_mode: 'HTML',
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: '📜 Privacy Policy',
							url: linkPrivacy.href,
						},
					],
				],
			},
		}
	)
}
