/*
Copyright (C) 2026 kyst14

This file is part of Ghost Catch Bot.

Ghost Catch Bot is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
Foobar is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Foobar. If not, see <https://www.gnu.org/licenses/>.
*/

import CryptoJS from 'crypto-js'
import 'dotenv/config'

const RAW_KEY = process.env.ENCRYPTION_KEY

if (!RAW_KEY || RAW_KEY.length < 32) {
	console.error('❌ ENCRYPTION_KEY must be at least 32 characters!')
	process.exit(1)
}

// Properly parse the key into a WordArray
const AES_KEY = CryptoJS.enc.Utf8.parse(RAW_KEY.substring(0, 32)) // Ensures exactly 256 bits (32 bytes)

// === Encryption text ===
export function encryptText(text: string): string {
	const iv = CryptoJS.lib.WordArray.random(16) // 16 bytes is standard for CBC
	const encrypted = CryptoJS.AES.encrypt(text, AES_KEY, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	})

	// Format: IV:Ciphertext (all hex)
	const ivHex = iv.toString(CryptoJS.enc.Hex)
	const ciphertext = encrypted.ciphertext.toString(CryptoJS.enc.Hex)

	return `${ivHex}:${ciphertext}`
}

export function decryptText(encryptedWithIv: string): string {
	try {
		const [ivHex, ciphertextHex] = encryptedWithIv.split(':')
		if (!ivHex || !ciphertextHex) {
			throw new Error('Invalid format')
		}

		const iv = CryptoJS.enc.Hex.parse(ivHex)
		const ciphertext = CryptoJS.enc.Hex.parse(ciphertextHex)

		const cipherParams = CryptoJS.lib.CipherParams.create({
			ciphertext,
		})

		const decrypted = CryptoJS.AES.decrypt(cipherParams, AES_KEY, {
			iv: iv,
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7,
		})

		return decrypted.toString(CryptoJS.enc.Utf8)
	} catch {
		throw new Error('Failed to decrypt text. Key mismatch or corrupted data.')
	}
}
