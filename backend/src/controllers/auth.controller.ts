import { Request, Response } from 'express'
import { AuthService } from '../services/auth.service'
import { ValidationError } from '../utils/errors'

const authService = new AuthService()

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body

    if (!email || !password) {
      throw new ValidationError('Email and password are required')
    }

    const result = await authService.register({ email, password, username })
    res.status(201).json(result)
  } catch (error: any) {
    console.error('Register error:', error)
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    
    // Erreurs de base de données
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        message: 'Impossible de se connecter à la base de données. Vérifiez que PostgreSQL est démarré.' 
      })
    }
    
    if (error.code === '42P01') { // Table n'existe pas
      return res.status(503).json({ 
        message: 'La base de données n\'est pas initialisée. Exécutez: npm run db:init' 
      })
    }
    
    // Erreur générique avec plus de détails en développement
    const message = process.env.NODE_ENV === 'development' 
      ? `Internal server error: ${error.message}`
      : 'Internal server error'
      
    res.status(500).json({ message })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      throw new ValidationError('Email and password are required')
    }

    const result = await authService.login({ email, password })
    res.json(result)
  } catch (error: any) {
    console.error('Login error:', error)
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    
    // Erreurs de base de données
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({ 
        message: 'Impossible de se connecter à la base de données. Vérifiez que PostgreSQL est démarré.' 
      })
    }
    
    if (error.code === '42P01') { // Table n'existe pas
      return res.status(503).json({ 
        message: 'La base de données n\'est pas initialisée. Exécutez: npm run db:init' 
      })
    }
    
    // Erreur générique avec plus de détails en développement
    const message = process.env.NODE_ENV === 'development' 
      ? `Internal server error: ${error.message}`
      : 'Internal server error'
      
    res.status(500).json({ message })
  }
}

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required')
    }

    const token = await authService.refreshAccessToken(refreshToken)
    res.json({ token })
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    res.status(500).json({ message: 'Internal server error' })
  }
}

