import { Router } from 'express'
import { getAllMedia, getMediaById, createMedia, updateMedia, deleteMedia } from '../controllers/media.controller'
import { authenticateToken } from '../middleware/auth.middleware'
import { uploadMedia } from '../config/upload'

export const mediaRoutes = Router()

// Public routes (no authentication required for browsing)
mediaRoutes.get('/', getAllMedia)
mediaRoutes.get('/:id', getMediaById)

// Protected routes (authentication required for creating/updating/deleting media)
mediaRoutes.post('/', authenticateToken, uploadMedia, createMedia)
mediaRoutes.put('/:id', authenticateToken, uploadMedia, updateMedia)
mediaRoutes.patch('/:id', authenticateToken, uploadMedia, updateMedia)
mediaRoutes.delete('/:id', authenticateToken, deleteMedia)

