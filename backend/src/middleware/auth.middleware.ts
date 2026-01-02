import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_CONFIG } from '../config/jwt'
import { AuthenticationError } from '../utils/errors'

export interface AuthRequest extends Request {
  userId?: number
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret) as { userId: number }
    req.userId = decoded.userId
    return next()
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}







