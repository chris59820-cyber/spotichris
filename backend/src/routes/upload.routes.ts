import { Router } from 'express'
import { uploadFile } from '../controllers/upload.controller.js'
import { authenticateToken } from '../middleware/auth.middleware.js'
import { uploadMedia } from '../config/upload.js'

export const uploadRoutes = Router()

// Route pour uploader un fichier
uploadRoutes.post('/', authenticateToken, uploadMedia, uploadFile)








