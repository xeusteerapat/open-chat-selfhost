import CryptoJS from 'crypto-js';

let encryptionKey: string;

export function setEncryptionKey(key: string): void {
	encryptionKey = key;
}

export function encryptApiKey(apiKey: string): string {
	if (!encryptionKey) {
		throw new Error('Encryption key not set');
	}
	return CryptoJS.AES.encrypt(apiKey, encryptionKey).toString();
}

export function decryptApiKey(encryptedKey: string): string {
	if (!encryptionKey) {
		throw new Error('Encryption key not set');
	}
	const bytes = CryptoJS.AES.decrypt(encryptedKey, encryptionKey);
	return bytes.toString(CryptoJS.enc.Utf8);
}
