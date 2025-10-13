import crypto from 'crypto';
import { config } from '@/config';
const algorithm = 'aes-256-gcm';
const key = crypto.scryptSync(config.encryptionKey, 'Gf82#$kLm9Pq3*Xv', 32); // Better salt
export function encryptApiKey(apiKey) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}
export function decryptApiKey(encryptedApiKey) {
    const [ivHex, authTagHex, encrypted] = encryptedApiKey.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
export function hashPassword(password) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(32);
        crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
            if (err)
                reject(err);
            resolve(salt.toString('hex') + ':' + derivedKey.toString('hex'));
        });
    });
}
export function verifyPassword(password, hash) {
    return new Promise((resolve, reject) => {
        const [saltHex, keyHex] = hash.split(':');
        const salt = Buffer.from(saltHex, 'hex');
        crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
            if (err)
                reject(err);
            resolve(derivedKey.toString('hex') === keyHex);
        });
    });
}
//# sourceMappingURL=encryption.js.map