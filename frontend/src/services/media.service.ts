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
  video_category?: 'Cinéma' | 'Série' | 'Documentaire' | 'Musique' | 'Sport'
  music_category?: 'Pop' | 'Rock' | 'Jazz' | 'Classique' | 'Hip-Hop' | 'Électronique' | 'Rap' | 'R&B' | 'Country' | 'Reggae' | 'Metal' | 'Blues' | 'Folk' | 'World' | 'Autre'
  created_at?: string
  updated_at?: string
}

export interface MediaListResponse {
  data: MediaItem[]
  total: number
  limit: number
  offset: number
}

class MediaService {
  async getAll(params?: {
    type?: 'music' | 'video'
    limit?: number
    offset?: number
    artist?: string
    music_category?: string
    video_category?: string
  }): Promise<MediaListResponse> {
    const response = await axios.get(`${API_URL}/media`, { params })
    return response.data
  }

  async getById(id: number): Promise<MediaItem> {
    const response = await axios.get(`${API_URL}/media/${id}`)
    return response.data
  }

  async update(id: number, data: {
    title?: string
    artist?: string
    album?: string
    description?: string
    duration?: number
    thumbnail_url?: string
    video_category?: string
    music_category?: string
  }): Promise<MediaItem> {
    const token = localStorage.getItem('token')
    const response = await axios.put(
      `${API_URL}/media/${id}`,
      data,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      }
    )
    return response.data
  }

  async delete(id: number): Promise<void> {
    const token = localStorage.getItem('token')
    await axios.delete(`${API_URL}/media/${id}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    })
  }
}

export const mediaService = new MediaService()

