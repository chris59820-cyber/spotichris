import { Request, Response } from 'express'
import { PlaylistService } from '../services/playlist.service.js'
import { ValidationError } from '../utils/errors.js'

const playlistService = new PlaylistService()

export const createPlaylist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' })
    }

    const { name, description, is_public } = req.body

    const playlist = await playlistService.create({
      user_id: userId,
      name,
      description,
      is_public: is_public ?? false,
    })

    return res.status(201).json(playlist)
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error creating playlist:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getPlaylist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const playlistId = parseInt(req.params.id, 10)

    if (isNaN(playlistId)) {
      throw new ValidationError('ID de playlist invalide')
    }

    const playlist = await playlistService.getById(playlistId, userId)
    return res.json(playlist)
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error getting playlist:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const getUserPlaylists = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' })
    }

    const playlists = await playlistService.getByUserId(userId)
    return res.json({ data: playlists })
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error getting user playlists:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const updatePlaylist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' })
    }

    const playlistId = parseInt(req.params.id, 10)
    if (isNaN(playlistId)) {
      throw new ValidationError('ID de playlist invalide')
    }

    const { name, description, is_public } = req.body

    const playlist = await playlistService.update(playlistId, userId, {
      name,
      description,
      is_public,
    })

    return res.json(playlist)
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error updating playlist:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const deletePlaylist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' })
    }

    const playlistId = parseInt(req.params.id, 10)
    if (isNaN(playlistId)) {
      throw new ValidationError('ID de playlist invalide')
    }

    await playlistService.delete(playlistId, userId)
    return res.status(200).json({ message: 'Playlist supprimée avec succès' })
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error deleting playlist:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export const addMediaToPlaylist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' })
    }

    const playlistId = parseInt(req.params.id, 10)
    const mediaId = parseInt(req.body.media_id, 10)

    if (isNaN(playlistId) || isNaN(mediaId)) {
      throw new ValidationError('ID de playlist ou média invalide')
    }

    await playlistService.addMedia(playlistId, userId, mediaId)
    return res.status(200).json({ message: 'Média ajouté à la playlist avec succès' })
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error adding media to playlist:', error)
    return res.status(500).json({ message: error.message || 'Internal server error' })
  }
}

export const removeMediaFromPlaylist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' })
    }

    const playlistId = parseInt(req.params.id, 10)
    const mediaId = parseInt(req.params.mediaId, 10)

    if (isNaN(playlistId) || isNaN(mediaId)) {
      throw new ValidationError('ID de playlist ou média invalide')
    }

    await playlistService.removeMedia(playlistId, userId, mediaId)
    return res.status(200).json({ message: 'Média retiré de la playlist avec succès' })
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error removing media from playlist:', error)
    return res.status(500).json({ message: error.message || 'Internal server error' })
  }
}

export const reorderMediaInPlaylist = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' })
    }

    const playlistId = parseInt(req.params.id, 10)
    const mediaId = parseInt(req.body.media_id, 10)
    const newPosition = parseInt(req.body.position, 10)

    if (isNaN(playlistId) || isNaN(mediaId) || isNaN(newPosition)) {
      throw new ValidationError('Paramètres invalides')
    }

    await playlistService.reorderMedia(playlistId, userId, mediaId, newPosition)
    return res.status(200).json({ message: 'Ordre mis à jour avec succès' })
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error reordering media in playlist:', error)
    return res.status(500).json({ message: error.message || 'Internal server error' })
  }
}

