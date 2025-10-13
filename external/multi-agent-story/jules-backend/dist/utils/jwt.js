import jwt from 'jsonwebtoken';
import { config } from '@/config';
export function generateTokens(userId, email, name) {
    const accessTokenPayload = {
        userId,
        email: email || '',
        name: name || '',
        type: 'access'
    };
    const refreshTokenPayload = {
        userId,
        email: email || '',
        name: name || '',
        type: 'refresh'
    };
    const accessToken = jwt.sign(accessTokenPayload, config.jwtSecret, { expiresIn: `${config.accessTokenExpireMinutes}m` });
    const refreshToken = jwt.sign(refreshTokenPayload, config.jwtSecret, { expiresIn: `${config.refreshTokenExpireDays}d` });
    return {
        accessToken,
        refreshToken
    };
}
export function verifyToken(token) {
    try {
        const payload = jwt.verify(token, config.jwtSecret);
        return payload;
    }
    catch (error) {
        throw new Error('Invalid token');
    }
}
export function decodeToken(token) {
    try {
        const decoded = jwt.decode(token);
        return decoded;
    }
    catch (error) {
        return null;
    }
}
//# sourceMappingURL=jwt.js.map