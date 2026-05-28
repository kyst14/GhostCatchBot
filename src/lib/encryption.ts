import CryptoJS from "crypto-js";
import 'dotenv/config'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    console.error("❌ ENCRYPTION_KEY должен быть минимум 32 символа!");
    process.exit(1);
}

function createIv(options: OptionType): CryptoJS.lib.WordArray {
    return CryptoJS.lib.WordArray.create([
        Number(options.id),
        options.createdAt.getTime(),
    ]);
}

type OptionType = {
	id: string | number | bigint,
	createdAt: Date,
}

// === Encryption text ===
export function encryptText(text: string, options: OptionType): string {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY!, {
        iv: createIv(options),
    }).toString();
}

export function decryptText(encrypted: string, options: OptionType): string {
    const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY!, {
        iv: createIv(options),
    });
    const result = bytes.toString(CryptoJS.enc.Utf8);

    if (!result) throw new Error("Failed to decrypt text");
    return result;
}

// === Encryption files (Buffer) ===
export function encryptBuffer(buffer: Buffer, options: OptionType): Buffer {
    const wordArray = CryptoJS.lib.WordArray.create(buffer);

    const encrypted = CryptoJS.AES.encrypt(wordArray, ENCRYPTION_KEY!, {
        iv: createIv(options),
    }).toString();

    return Buffer.from(encrypted, "utf8");
}

export function decryptBuffer(encryptedBuffer: Buffer, options: OptionType): Buffer {
    const encryptedStr = encryptedBuffer.toString("utf8");

    const decrypted = CryptoJS.AES.decrypt(encryptedStr, ENCRYPTION_KEY!, {
        iv: createIv(options),
    });

    const base64 = decrypted.toString(CryptoJS.enc.Base64);

    return Buffer.from(base64, "base64");
}