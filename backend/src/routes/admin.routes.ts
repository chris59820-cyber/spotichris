import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.middleware.js'
import { MediaModel } from '../models/Media.model.js'

export const adminRoutes = Router()

// Toutes les routes admin nécessitent une authentification
adminRoutes.use(authenticateToken)

// Route pour récupérer tous les médias de la base de données
adminRoutes.get('/database-media', async (_req, res) => {
  try {
    // Récupérer tous les médias de la base de données
    const media = await MediaModel.findAll(1000, 0) // Limite élevée pour récupérer tous les médias
    
    return res.json(media)
  } catch (error: any) {
    console.error('Error fetching database media:', error)
    return res.status(500).json({ message: 'Erreur lors de la récupération des médias' })
  }
})







