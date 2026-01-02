import pool from '../config/database.js'

export interface UserMedia {
  id: number
  user_id: number
  media_id: number
  is_favorite: boolean
  is_downloaded: boolean
  last_played_at: Date | null
  play_count: number
  created_at: Date
}

export interface CreateUserMediaData {
  user_id: number
  media_id: number
  is_favorite?: boolean
  is_downloaded?: boolean
}

export class UserMediaModel {
  /**
   * Créer ou mettre à jour une relation user-media
   */
  static async upsert(data: CreateUserMediaData): Promise<UserMedia> {
    const result = await pool.query(
      `INSERT INTO user_media (user_id, media_id, is_favorite, is_downloaded, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, media_id)
       DO UPDATE SET
         is_favorite = COALESCE(EXCLUDED.is_favorite, user_media.is_favorite),
         is_downloaded = COALESCE(EXCLUDED.is_downloaded, user_media.is_downloaded)
       RETURNING *`,
      [
        data.user_id,
        data.media_id,
        data.is_favorite ?? false,
        data.is_downloaded ?? false,
      ]
    )
    return result.rows[0]
  }

  /**
   * Récupérer une relation user-media
   */
  static async findByUserAndMedia(userId: number, mediaId: number): Promise<UserMedia | null> {
    const result = await pool.query(
      'SELECT * FROM user_media WHERE user_id = $1 AND media_id = $2',
      [userId, mediaId]
    )
    return result.rows[0] || null
  }

  /**
   * Mettre à jour le statut favori
   */
  static async toggleFavorite(userId: number, mediaId: number): Promise<UserMedia> {
    // Vérifier si la relation existe
    let userMedia = await this.findByUserAndMedia(userId, mediaId)

    if (!userMedia) {
      // Créer la relation si elle n'existe pas
      userMedia = await this.upsert({
        user_id: userId,
        media_id: mediaId,
        is_favorite: true,
      })
    } else {
      // Toggle le statut favori
      const result = await pool.query(
        `UPDATE user_media
         SET is_favorite = NOT is_favorite
         WHERE user_id = $1 AND media_id = $2
         RETURNING *`,
        [userId, mediaId]
      )
      if (!result.rows[0]) {
        throw new Error('Failed to update user_media')
      }
      userMedia = result.rows[0]
    }

    if (!userMedia) {
      throw new Error('Failed to get user_media')
    }

    return userMedia
  }

  /**
   * Récupérer tous les favoris d'un utilisateur avec les détails des médias
   */
  static async findFavoritesByUser(userId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT 
        um.id,
        um.user_id,
        um.media_id,
        um.is_favorite,
        um.is_downloaded,
        um.last_played_at,
        um.play_count,
        um.created_at,
        m.title,
        m.description,
        m.artist,
        m.album,
        m.duration,
        m.type,
        m.url,
        m.thumbnail_url,
        m.video_category,
        m.music_category,
        m.created_at as media_created_at
       FROM user_media um
       JOIN media m ON um.media_id = m.id
       WHERE um.user_id = $1 AND um.is_favorite = true
       ORDER BY um.created_at DESC`,
      [userId]
    )
    return result.rows
  }

  /**
   * Récupérer le statut favori pour plusieurs médias
   */
  static async getFavoriteStatuses(userId: number, mediaIds: number[]): Promise<Map<number, boolean>> {
    if (mediaIds.length === 0) {
      return new Map()
    }

    const result = await pool.query(
      `SELECT media_id, is_favorite 
       FROM user_media 
       WHERE user_id = $1 AND media_id = ANY($2::int[])`,
      [userId, mediaIds]
    )

    const statusMap = new Map<number, boolean>()
    result.rows.forEach((row) => {
      statusMap.set(row.media_id, row.is_favorite)
    })

    return statusMap
  }
}

