import jwt from 'jsonwebtoken'

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}

export const verifyToken = (token: string): { userId: number } => {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret) as { userId: number }
    return decoded
  } catch (error) {
    throw new Error('Token invalide ou expiré')
  }
}

