import pool from '../config/database.js'

export interface SearchResult {
  music: any[]
  video: any[]
}

export class SearchService {
  async search(query: string, type: 'all' | 'music' | 'video'): Promise<SearchResult> {
    const searchTerm = `%${query}%`
    const results: SearchResult = {
      music: [],
      video: [],
    }

    try {
      if (type === 'all' || type === 'music') {
        // Search in media table for music (assuming type='music' column exists)
        const musicResult = await pool.query(
          `SELECT id, title, artist, album, duration, type, created_at
           FROM media 
           WHERE type = 'music' 
           AND (title ILIKE $1 OR artist ILIKE $1 OR album ILIKE $1)
           LIMIT 20`,
          [searchTerm]
        )
        results.music = musicResult.rows
      }

      if (type === 'all' || type === 'video') {
        // Search in media table for video (assuming type='video' column exists)
        const videoResult = await pool.query(
          `SELECT id, title, description, duration, type, created_at
           FROM media 
           WHERE type = 'video' 
           AND (title ILIKE $1 OR description ILIKE $1)
           LIMIT 20`,
          [searchTerm]
        )
        results.video = videoResult.rows
      }

      return results
    } catch (error) {
      // If table doesn't exist yet, return empty results
      console.warn('Search table might not exist yet:', error)
      return results
    }
  }
}







