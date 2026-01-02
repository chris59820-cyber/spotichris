import { Router } from 'express'
import {
  createPlaylist,
  getPlaylist,
  getUserPlaylists,
  updatePlaylist,
  deletePlaylist,
  addMediaToPlaylist,
  removeMediaFromPlaylist,
  reorderMediaInPlaylist,
} from '../controllers/playlist.controller'
import { authenticateToken } from '../middleware/auth.middleware'

export const playlistRoutes = Router()

// Toutes les routes nécessitent une authentification
playlistRoutes.use(authenticateToken)

// Créer une playlist
playlistRoutes.post('/', createPlaylist)

// Récupérer toutes les playlists de l'utilisateur
playlistRoutes.get('/', getUserPlaylists)

// Récupérer une playlist spécifique
playlistRoutes.get('/:id', getPlaylist)

// Mettre à jour une playlist
playlistRoutes.put('/:id', updatePlaylist)
playlistRoutes.patch('/:id', updatePlaylist)

// Supprimer une playlist
playlistRoutes.delete('/:id', deletePlaylist)

// Ajouter un média à une playlist
playlistRoutes.post('/:id/media', addMediaToPlaylist)

// Retirer un média d'une playlist
playlistRoutes.delete('/:id/media/:mediaId', removeMediaFromPlaylist)

// Réorganiser les médias dans une playlist
playlistRoutes.put('/:id/reorder', reorderMediaInPlaylist)







