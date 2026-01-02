import pool from '../config/database'

export interface Playlist {
  id: number
  user_id: number
  name: string
  description?: string
  is_public: boolean
  created_at: Date
  updated_at: Date
}

export interface CreatePlaylistData {
  user_id: number
  name: string
  description?: string
  is_public?: boolean
}

export class PlaylistModel {
  static async create(data: CreatePlaylistData): Promise<Playlist> {
    const result = await pool.query(
      `INSERT INTO playlists (user_id, name, description, is_public, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [data.user_id, data.name, data.description || null, data.is_public || false]
    )
    return result.rows[0]
  }

  static async findById(id: number): Promise<Playlist | null> {
    const result = await pool.query('SELECT * FROM playlists WHERE id = $1', [id])
    return result.rows[0] || null
  }

  static async findByUserId(userId: number): Promise<Playlist[]> {
    const result = await pool.query(
      'SELECT * FROM playlists WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    return result.rows
  }

  static async update(id: number, data: Partial<CreatePlaylistData>): Promise<Playlist> {
    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (data.name) {
      updates.push(`name = $${paramCount++}`)
      values.push(data.name)
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`)
      values.push(data.description)
    }
    if (data.is_public !== undefined) {
      updates.push(`is_public = $${paramCount++}`)
      values.push(data.is_public)
    }

    updates.push(`updated_at = NOW()`)
    values.push(id)

    const result = await pool.query(
      `UPDATE playlists SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    )
    return result.rows[0]
  }

  static async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM playlists WHERE id = $1', [id])
  }
}







