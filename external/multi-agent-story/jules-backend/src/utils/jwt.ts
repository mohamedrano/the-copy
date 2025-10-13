import jwt from "jsonwebtoken";
import { config } from "@/config";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  type: "access" | "refresh";
}

export function generateTokens(userId: string, email?: string, name?: string) {
  const accessTokenPayload: TokenPayload = {
    userId,
    email: email || "",
    name: name || "",
    type: "access",
  };

  const refreshTokenPayload: TokenPayload = {
    userId,
    email: email || "",
    name: name || "",
    type: "refresh",
  };

  const accessToken = jwt.sign(accessTokenPayload, config.jwtSecret, {
    expiresIn: `${config.accessTokenExpireMinutes}m`,
  });

  const refreshToken = jwt.sign(refreshTokenPayload, config.jwtSecret, {
    expiresIn: `${config.refreshTokenExpireDays}d`,
  });

  return {
    accessToken,
    refreshToken,
  };
}

export function verifyToken(token: string): TokenPayload {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    return payload;
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
