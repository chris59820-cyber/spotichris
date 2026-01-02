import { Request, Response } from 'express'
import { FavoritesService } from '../services/favorites.service'
import { ValidationError } from '../utils/errors'

const favoritesService = new FavoritesService()

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' })
    }

    const mediaId = parseInt(req.params.mediaId, 10)
    if (isNaN(mediaId)) {
      throw new ValidationError('ID de média invalide')
    }

    const result = await favoritesService.toggleFavorite(userId, mediaId)
    return res.json(result)
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error toggling favorite:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getFavoriteStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' })
    }

    const mediaId = parseInt(req.params.mediaId, 10)
    if (isNaN(mediaId)) {
      throw new ValidationError('ID de média invalide')
    }

    const result = await favoritesService.getFavoriteStatus(userId, mediaId)
    return res.json(result)
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error getting favorite status:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getUserFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' })
    }

    const favorites = await favoritesService.getUserFavorites(userId)
    return res.json({ data: favorites })
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error getting user favorites:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getFavoriteStatuses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' })
    }

    const mediaIds = req.query.mediaIds
    if (!mediaIds || typeof mediaIds !== 'string') {
      throw new ValidationError('mediaIds est requis')
    }

    const ids = mediaIds.split(',').map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
    const statusMap = await favoritesService.getFavoriteStatuses(userId, ids)

    // Convertir Map en objet pour JSON
    const result: Record<number, boolean> = {}
    statusMap.forEach((value, key) => {
      result[key] = value
    })

    return res.json(result)
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error getting favorite statuses:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

