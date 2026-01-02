import axios from 'axios'

const API_URL = '/api'

export interface MediaItem {
  id: number
  title: string
  description?: string
  artist?: string
  album?: string
  duration?: number
  type: 'music' | 'video'
  url?: string
  thumbnail_url?: string
}

export interface SearchResults {
  music: MediaItem[]
  video: MediaItem[]
}

class SearchService {
  async search(query: string, type: 'all' | 'music' | 'video' = 'all'): Promise<SearchResults> {
    const response = await axios.get(`${API_URL}/search`, {
      params: { q: query, type },
    })
    return response.data
  }
}

export const searchService = new SearchService()







