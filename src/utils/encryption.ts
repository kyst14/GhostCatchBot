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
	} catch (error) {
		throw new Error('Failed to decrypt text. Key mismatch or corrupted data.')
	}
}

// === Encryption files (Buffer) ===
export function encryptBuffer(buffer: Buffer): Buffer {
	const wordArray = CryptoJS.lib.WordArray.create(buffer as any)
	const iv = CryptoJS.lib.WordArray.random(16)

	const encrypted = CryptoJS.AES.encrypt(wordArray, AES_KEY, {
		iv: iv,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	})

	// Convert everything to a single Hex string
	const outputHex =
		iv.toString(CryptoJS.enc.Hex) + encrypted.ciphertext.toString(CryptoJS.enc.Hex)
	return Buffer.from(outputHex, 'hex')
}

export function decryptBuffer(encryptedBuffer: Buffer): Buffer {
	try {
		const hexString = encryptedBuffer.toString('hex')
		if (hexString.length < 32) throw new Error('Invalid encrypted buffer')

		const ivHex = hexString.substring(0, 32)
		const ciphertextHex = hexString.substring(32)

		const iv = CryptoJS.enc.Hex.parse(ivHex)
		const ciphertext = CryptoJS.enc.Hex.parse(ciphertextHex)

		const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext })

		const decryptedWordArray = CryptoJS.AES.decrypt(cipherParams, AES_KEY, {
			iv: iv,
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7,
		})

		const decryptedBuffer = Buffer.from(
			decryptedWordArray.toString(CryptoJS.enc.Base64),
			'base64'
		)

		if (decryptedBuffer.length === 0) {
			throw new Error('Decryption produced empty result')
		}

		return decryptedBuffer
	} catch (error) {
		throw new Error('Failed to decrypt buffer. Key mismatch or corrupted data.')
	}
}
