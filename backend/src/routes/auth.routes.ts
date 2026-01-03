import { Router } from 'express'
import { register, login, refresh } from '../controllers/auth.controller.js'

export const authRoutes = Router()

authRoutes.post('/register', register)
authRoutes.post('/login', login)
authRoutes.post('/refresh', refresh)








