import { Router } from 'express'
import { toggleFavorite, getFavoriteStatus, getUserFavorites, getFavoriteStatuses } from '../controllers/favorites.controller'
import { authenticateToken } from '../middleware/auth.middleware'

export const favoritesRoutes = Router()

// Toutes les routes nécessitent une authentification
favoritesRoutes.use(authenticateToken)

// Basculer le statut favori d'un média
favoritesRoutes.post('/:mediaId', toggleFavorite)

// Récupérer le statut favori d'un média
favoritesRoutes.get('/:mediaId', getFavoriteStatus)

// Récupérer tous les favoris de l'utilisateur
favoritesRoutes.get('/', getUserFavorites)

// Récupérer les statuts favoris pour plusieurs médias
favoritesRoutes.get('/status/batch', getFavoriteStatuses)

