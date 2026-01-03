import { PlaylistModel, Playlist, CreatePlaylistData } from '../models/Playlist.model.js'
import { PlaylistItemModel } from '../models/PlaylistItem.model.js'
import { NotFoundError, ValidationError } from '../utils/errors.js'

export interface PlaylistWithItems extends Playlist {
  items?: any[]
  item_count?: number
}

export class PlaylistService {
  /**
   * Créer une nouvelle playlist
   */
  async create(data: CreatePlaylistData): Promise<Playlist> {
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Le nom de la playlist est requis')
    }

    return await PlaylistModel.create(data)
  }

  /**
   * Récupérer une playlist par ID avec ses items
   */
  async getById(id: number, userId?: number): Promise<PlaylistWithItems> {
    const playlist = await PlaylistModel.findById(id)
    if (!playlist) {
      throw new NotFoundError(`Playlist avec l'id ${id} introuvable`)
    }

    // Vérifier les permissions si userId est fourni
    if (userId && playlist.user_id !== userId && !playlist.is_public) {
      throw new NotFoundError('Playlist introuvable ou non accessible')
    }

    const items = await PlaylistItemModel.findByPlaylistId(id)
    return {
      ...playlist,
      items,
      item_count: items.length,
    }
  }

  /**
   * Récupérer toutes les playlists d'un utilisateur
   */
  async getByUserId(userId: number): Promise<PlaylistWithItems[]> {
    const playlists = await PlaylistModel.findByUserId(userId)
    
    // Charger les items pour chaque playlist
    const playlistsWithItems = await Promise.all(
      playlists.map(async (playlist) => {
        const items = await PlaylistItemModel.findByPlaylistId(playlist.id)
        return {
          ...playlist,
          items,
          item_count: items.length,
        }
      })
    )

    return playlistsWithItems
  }

  /**
   * Mettre à jour une playlist
   */
  async update(id: number, userId: number, data: Partial<CreatePlaylistData>): Promise<Playlist> {
    const playlist = await PlaylistModel.findById(id)
    if (!playlist) {
      throw new NotFoundError(`Playlist avec l'id ${id} introuvable`)
    }

    if (playlist.user_id !== userId) {
      throw new ValidationError('Vous n\'avez pas la permission de modifier cette playlist')
    }

    return await PlaylistModel.update(id, data)
  }

  /**
   * Supprimer une playlist
   */
  async delete(id: number, userId: number): Promise<void> {
    const playlist = await PlaylistModel.findById(id)
    if (!playlist) {
      throw new NotFoundError(`Playlist avec l'id ${id} introuvable`)
    }

    if (playlist.user_id !== userId) {
      throw new ValidationError('Vous n\'avez pas la permission de supprimer cette playlist')
    }

    await PlaylistModel.delete(id)
  }

  /**
   * Ajouter un média à une playlist
   */
  async addMedia(playlistId: number, userId: number, mediaId: number): Promise<void> {
    const playlist = await PlaylistModel.findById(playlistId)
    if (!playlist) {
      throw new NotFoundError(`Playlist avec l'id ${playlistId} introuvable`)
    }

    if (playlist.user_id !== userId) {
      throw new ValidationError('Vous n\'avez pas la permission de modifier cette playlist')
    }

    await PlaylistItemModel.create({
      playlist_id: playlistId,
      media_id: mediaId,
    })
  }

  /**
   * Retirer un média d'une playlist
   */
  async removeMedia(playlistId: number, userId: number, mediaId: number): Promise<void> {
    const playlist = await PlaylistModel.findById(playlistId)
    if (!playlist) {
      throw new NotFoundError(`Playlist avec l'id ${playlistId} introuvable`)
    }

    if (playlist.user_id !== userId) {
      throw new ValidationError('Vous n\'avez pas la permission de modifier cette playlist')
    }

    await PlaylistItemModel.delete(playlistId, mediaId)
  }

  /**
   * Réorganiser les médias dans une playlist
   */
  async reorderMedia(playlistId: number, userId: number, mediaId: number, newPosition: number): Promise<void> {
    const playlist = await PlaylistModel.findById(playlistId)
    if (!playlist) {
      throw new NotFoundError(`Playlist avec l'id ${playlistId} introuvable`)
    }

    if (playlist.user_id !== userId) {
      throw new ValidationError('Vous n\'avez pas la permission de modifier cette playlist')
    }

    await PlaylistItemModel.moveItem(playlistId, mediaId, newPosition)
  }
}








