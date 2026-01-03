import pool from '../config/database.js'

export interface PlaylistItem {
  id: number
  playlist_id: number
  media_id: number
  position: number
  added_at: Date
}

export interface CreatePlaylistItemData {
  playlist_id: number
  media_id: number
  position?: number
}

export class PlaylistItemModel {
  /**
   * Ajouter un média à une playlist
   */
  static async create(data: CreatePlaylistItemData): Promise<PlaylistItem> {
    // Si position n'est pas fournie, trouver la prochaine position disponible
    let position = data.position
    if (position === undefined) {
      const maxPositionResult = await pool.query(
        'SELECT COALESCE(MAX(position), 0) as max_position FROM playlist_items WHERE playlist_id = $1',
        [data.playlist_id]
      )
      position = parseInt(maxPositionResult.rows[0].max_position, 10) + 1
    }

    const result = await pool.query(
      `INSERT INTO playlist_items (playlist_id, media_id, position, added_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (playlist_id, media_id) DO NOTHING
       RETURNING *`,
      [data.playlist_id, data.media_id, position]
    )

    if (result.rows.length === 0) {
      // Le média existe déjà dans la playlist
      throw new Error('Ce média est déjà dans cette playlist')
    }

    return result.rows[0]
  }

  /**
   * Récupérer tous les items d'une playlist avec les détails des médias
   */
  static async findByPlaylistId(playlistId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT 
        pi.id,
        pi.playlist_id,
        pi.media_id,
        pi.position,
        pi.added_at,
        m.title,
        m.artist,
        m.album,
        m.duration,
        m.type,
        m.url,
        m.thumbnail_url,
        m.video_category,
        m.music_category
       FROM playlist_items pi
       JOIN media m ON pi.media_id = m.id
       WHERE pi.playlist_id = $1
       ORDER BY pi.position ASC, pi.added_at ASC`,
      [playlistId]
    )
    return result.rows
  }

  /**
   * Retirer un média d'une playlist
   */
  static async delete(playlistId: number, mediaId: number): Promise<void> {
    const result = await pool.query(
      'DELETE FROM playlist_items WHERE playlist_id = $1 AND media_id = $2',
      [playlistId, mediaId]
    )

    if (result.rowCount === 0) {
      throw new Error('Ce média n\'est pas dans cette playlist')
    }

    // Réorganiser les positions
    await this.reorderPositions(playlistId)
  }

  /**
   * Réorganiser les positions des items dans une playlist
   */
  static async reorderPositions(playlistId: number): Promise<void> {
    const items = await pool.query(
      'SELECT id FROM playlist_items WHERE playlist_id = $1 ORDER BY position ASC, added_at ASC',
      [playlistId]
    )

    for (let i = 0; i < items.rows.length; i++) {
      await pool.query(
        'UPDATE playlist_items SET position = $1 WHERE id = $2',
        [i + 1, items.rows[i].id]
      )
    }
  }

  /**
   * Déplacer un item dans une playlist
   */
  static async moveItem(playlistId: number, mediaId: number, newPosition: number): Promise<void> {
    // Vérifier que la nouvelle position est valide
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM playlist_items WHERE playlist_id = $1',
      [playlistId]
    )
    const totalItems = parseInt(countResult.rows[0].count, 10)
    if (newPosition < 1 || newPosition > totalItems) {
      throw new Error('Position invalide')
    }

    // Récupérer l'item actuel
    const currentItem = await pool.query(
      'SELECT position FROM playlist_items WHERE playlist_id = $1 AND media_id = $2',
      [playlistId, mediaId]
    )

    if (currentItem.rows.length === 0) {
      throw new Error('Ce média n\'est pas dans cette playlist')
    }

    const currentPosition = currentItem.rows[0].position

    if (currentPosition === newPosition) {
      return // Pas de changement nécessaire
    }

    // Déplacer les autres items
    if (newPosition > currentPosition) {
      // Déplacer vers le bas
      await pool.query(
        `UPDATE playlist_items 
         SET position = position - 1 
         WHERE playlist_id = $1 AND position > $2 AND position <= $3`,
        [playlistId, currentPosition, newPosition]
      )
    } else {
      // Déplacer vers le haut
      await pool.query(
        `UPDATE playlist_items 
         SET position = position + 1 
         WHERE playlist_id = $1 AND position >= $2 AND position < $3`,
        [playlistId, newPosition, currentPosition]
      )
    }

    // Mettre à jour la position de l'item
    await pool.query(
      'UPDATE playlist_items SET position = $1 WHERE playlist_id = $2 AND media_id = $3',
      [newPosition, playlistId, mediaId]
    )
  }
}








