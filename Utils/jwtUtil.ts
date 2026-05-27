import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "fallback_secret_for_dev_only";

interface TokenPayload {
  userId: string;
  username: string;
  email: string;
}

function setUser(userId: string, username: string, email: string): string {
  const payload: TokenPayload = {
    userId,
    username,
    email
  };

  return jwt.sign(payload, secret, { expiresIn: "24h" });
}

function getUser(token: string): TokenPayload | null {
  try {
    if (!token) return null;
    return jwt.verify(token, secret) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export { setUser, getUser };
