import { Router } from 'express'
import { getCurrentUser, updateUser } from '../controllers/user.controller.js'
import { authenticateToken } from '../middleware/auth.middleware.js'

export const userRoutes = Router()

userRoutes.get('/me', authenticateToken, getCurrentUser)
userRoutes.put('/me', authenticateToken, updateUser)








