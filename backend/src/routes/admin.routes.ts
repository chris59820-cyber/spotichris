import { Router } from 'express'
import { authenticateToken } from '../middleware/auth.middleware'
import { MediaModel } from '../models/media.model'

export const adminRoutes = Router()

// Toutes les routes admin nécessitent une authentification
adminRoutes.use(authenticateToken)

// Route pour récupérer tous les médias de la base de données
adminRoutes.get('/database-media', async (req, res) => {
  try {
    // Récupérer tous les médias de la base de données
    const media = await MediaModel.findAll(1000, 0) // Limite élevée pour récupérer tous les médias
    
    res.json(media)
  } catch (error: any) {
    console.error('Error fetching database media:', error)
    res.status(500).json({ message: 'Erreur lors de la récupération des médias' })
  }
})






