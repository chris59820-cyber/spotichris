import { UserMediaModel } from '../models/UserMedia.model'
import { NotFoundError } from '../utils/errors'

export class FavoritesService {
  /**
   * Basculer le statut favori d'un média pour un utilisateur
   */
  async toggleFavorite(userId: number, mediaId: number): Promise<{ is_favorite: boolean }> {
    const userMedia = await UserMediaModel.toggleFavorite(userId, mediaId)
    return { is_favorite: userMedia.is_favorite }
  }

  /**
   * Récupérer le statut favori d'un média pour un utilisateur
   */
  async getFavoriteStatus(userId: number, mediaId: number): Promise<{ is_favorite: boolean }> {
    const userMedia = await UserMediaModel.findByUserAndMedia(userId, mediaId)
    return { is_favorite: userMedia?.is_favorite ?? false }
  }

  /**
   * Récupérer tous les favoris d'un utilisateur avec les détails des médias
   */
  async getUserFavorites(userId: number): Promise<any[]> {
    const favorites = await UserMediaModel.findFavoritesByUser(userId)
    // Les détails des médias sont déjà inclus dans la requête
    return favorites.map((fav) => ({
      id: fav.media_id,
      title: fav.title,
      description: fav.description,
      artist: fav.artist,
      album: fav.album,
      duration: fav.duration,
      type: fav.type,
      url: fav.url,
      thumbnail_url: fav.thumbnail_url,
      video_category: fav.video_category,
      music_category: fav.music_category,
      created_at: fav.media_created_at,
      favorited_at: fav.created_at,
    }))
  }

  /**
   * Récupérer les statuts favoris pour plusieurs médias
   */
  async getFavoriteStatuses(userId: number, mediaIds: number[]): Promise<Map<number, boolean>> {
    return await UserMediaModel.getFavoriteStatuses(userId, mediaIds)
  }
}

