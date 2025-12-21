import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserModel, CreateUserData } from '../models/User.model'
import { JWT_CONFIG } from '../config/jwt'
import { AuthenticationError, ValidationError } from '../utils/errors'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: {
    id: number
    email: string
    username?: string
  }
}

export class AuthService {
  async register(data: CreateUserData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(data.email)
    if (existingUser) {
      throw new ValidationError('Email already registered')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10)

    // Create user
    const user = await UserModel.create({
      ...data,
      password: passwordHash,
    })

    // Generate tokens
    const token = this.generateToken(user.id)
    const refreshToken = this.generateRefreshToken(user.id)

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username || undefined,
      },
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials

    // Find user
    const user = await UserModel.findByEmail(email)
    if (!user) {
      throw new AuthenticationError('Invalid email or password')
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password')
    }

    // Generate tokens
    const token = this.generateToken(user.id)
    const refreshToken = this.generateRefreshToken(user.id)

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username || undefined,
      },
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_CONFIG.refreshSecret) as { userId: number }
      return this.generateToken(decoded.userId)
    } catch (error) {
      throw new AuthenticationError('Invalid refresh token')
    }
  }

  private generateToken(userId: number): string {
    return jwt.sign({ userId }, JWT_CONFIG.secret, {
      expiresIn: JWT_CONFIG.expiresIn,
    })
  }

  private generateRefreshToken(userId: number): string {
    return jwt.sign({ userId }, JWT_CONFIG.refreshSecret, {
      expiresIn: JWT_CONFIG.refreshExpiresIn,
    })
  }
}

