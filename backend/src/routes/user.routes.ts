import { Router } from 'express'
import { getCurrentUser, updateUser } from '../controllers/user.controller'
import { authenticateToken } from '../middleware/auth.middleware'

export const userRoutes = Router()

userRoutes.get('/me', authenticateToken, getCurrentUser)
userRoutes.put('/me', authenticateToken, updateUser)







