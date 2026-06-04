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
