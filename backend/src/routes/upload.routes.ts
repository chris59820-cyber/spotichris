import { Router } from 'express'
import { uploadFile } from '../controllers/upload.controller'
import { authenticateToken } from '../middleware/auth.middleware'
import { uploadMedia } from '../config/upload'

export const uploadRoutes = Router()

// Route pour uploader un fichier
uploadRoutes.post('/', authenticateToken, uploadMedia, uploadFile)







