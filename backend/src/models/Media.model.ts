import pool from '../config/database'

export type MediaType = 'music' | 'video'

export type VideoCategory = 'Cinéma' | 'Série' | 'Documentaire' | 'Musique' | 'Sport'

export type VideoGenre = 'Action' | 'Animation' | 'Arts martiaux' | 'Aventure' | 'Biopic' | 'Comédie' | 'Comédie dramatique' | 'Comédie romantique' | 'Documentaire' | 'Drame' | 'Espionnage' | 'Fantastique' | 'Film musical' | 'Guerre' | 'Horreur' | 'Paranormal' | 'Policier' | 'Romance' | 'Science-fiction' | 'Sitcom' | 'Super-héros' | 'Thriller' | 'Thriller politique' | 'Thriller psychologique' | 'Western'

export type MusicCategory = 'Pop' | 'Rock' | 'Jazz' | 'Classique' | 'Hip-Hop' | 'Électronique' | 'Rap' | 'R&B' | 'Country' | 'Reggae' | 'Metal' | 'Blues' | 'Folk' | 'World' | 'Autre'

export interface Media {
  id: number
  title: string
  description?: string
  artist?: string
  album?: string
  duration?: number
  type: MediaType
  url?: string
  thumbnail_url?: string
  video_category?: VideoCategory
  genre?: VideoGenre
  music_category?: MusicCategory
  created_at: Date
  updated_at: Date
}

export interface CreateMediaData {
  title: string
  description?: string
  artist?: string
  album?: string
  duration?: number
  type: MediaType
  url?: string
  thumbnail_url?: string
  video_category?: VideoCategory
  genre?: VideoGenre
}

export interface UpdateMediaData {
  title?: string
  description?: string
  artist?: string
  album?: string
  duration?: number
  url?: string
  thumbnail_url?: string
  video_category?: VideoCategory
  genre?: VideoGenre
  music_category?: MusicCategory
}

export class MediaModel {
  static async create(data: CreateMediaData): Promise<Media> {
    const result = await pool.query(
      `INSERT INTO media (title, description, artist, album, duration, type, url, thumbnail_url, video_category, genre, music_category, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING *`,
      [
        data.title,
        data.description || null,
        data.artist || null,
        data.album || null,
        data.duration || null,
        data.type,
        data.url || null,
        data.thumbnail_url || null,
        data.video_category || null,
        data.genre || null,
        data.music_category || null,
      ]
    )
    return result.rows[0]
  }

  static async findById(id: number): Promise<Media | null> {
    const result = await pool.query('SELECT * FROM media WHERE id = $1', [id])
    return result.rows[0] || null
  }

  static async findByType(
    type: MediaType,
    limit: number = 50,
    filters?: { artist?: string; music_category?: string; video_category?: string }
  ): Promise<Media[]> {
    let query = 'SELECT * FROM media WHERE type = $1'
    const values: any[] = [type]
    let paramIndex = 2

    if (filters?.artist) {
      query += ` AND artist ILIKE $${paramIndex++}`
      values.push(`%${filters.artist}%`)
    }

    if (filters?.music_category && type === 'music') {
      query += ` AND music_category = $${paramIndex++}`
      values.push(filters.music_category)
    }

    if (filters?.video_category && type === 'video') {
      query += ` AND video_category = $${paramIndex++}`
      values.push(filters.video_category)
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`
    values.push(limit)

    const result = await pool.query(query, values)
    return result.rows
  }

  static async count(filters?: {
    type?: MediaType
    artist?: string
    music_category?: string
    video_category?: string
  }): Promise<number> {
    let query = 'SELECT COUNT(*) as count FROM media WHERE 1=1'
    const values: any[] = []
    let paramIndex = 1

    if (filters?.type) {
      query += ` AND type = $${paramIndex++}`
      values.push(filters.type)
    }

    if (filters?.artist) {
      query += ` AND artist ILIKE $${paramIndex++}`
      values.push(`%${filters.artist}%`)
    }

    if (filters?.music_category) {
      query += ` AND music_category = $${paramIndex++}`
      values.push(filters.music_category)
    }

    if (filters?.video_category) {
      query += ` AND video_category = $${paramIndex++}`
      values.push(filters.video_category)
    }

    const result = await pool.query(query, values)
    return parseInt(result.rows[0].count, 10)
  }

  static async findAll(limit: number = 50, offset: number = 0): Promise<Media[]> {
    const result = await pool.query(
      'SELECT * FROM media ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    )
    return result.rows
  }

  static async update(id: number, data: UpdateMediaData): Promise<Media> {
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      values.push(data.title)
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(data.description || null)
    }
    if (data.artist !== undefined) {
      updates.push(`artist = $${paramIndex++}`)
      values.push(data.artist || null)
    }
    if (data.album !== undefined) {
      updates.push(`album = $${paramIndex++}`)
      values.push(data.album || null)
    }
    if (data.duration !== undefined) {
      updates.push(`duration = $${paramIndex++}`)
      values.push(data.duration || null)
    }
    if (data.url !== undefined) {
      updates.push(`url = $${paramIndex++}`)
      values.push(data.url || null)
    }
    if (data.thumbnail_url !== undefined) {
      updates.push(`thumbnail_url = $${paramIndex++}`)
      values.push(data.thumbnail_url || null)
    }
    if (data.video_category !== undefined) {
      updates.push(`video_category = $${paramIndex++}`)
      values.push(data.video_category || null)
    }
    if (data.genre !== undefined) {
      updates.push(`genre = $${paramIndex++}`)
      values.push(data.genre || null)
    }
    if (data.music_category !== undefined) {
      updates.push(`music_category = $${paramIndex++}`)
      values.push(data.music_category || null)
    }

    if (updates.length === 0) {
      // No updates to make, return current media
      return await this.findById(id) as Media
    }

    updates.push(`updated_at = NOW()`)
    values.push(id)

    const query = `UPDATE media SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`
    const result = await pool.query(query, values)

    if (result.rows.length === 0) {
      throw new Error(`Media with id ${id} not found`)
    }

    return result.rows[0]
  }

  static async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM media WHERE id = $1 RETURNING *', [id])
    return result.rows.length > 0
  }
}

