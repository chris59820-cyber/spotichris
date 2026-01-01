import axios from 'axios'

const API_URL = '/api'

export interface Playlist {
  id: number
  user_id: number
  name: string
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
  items?: PlaylistItem[]
  item_count?: number
}

export interface PlaylistItem {
  id: number
  playlist_id: number
  media_id: number
  position: number
  added_at: string
  title: string
  artist?: string
  album?: string
  duration?: number
  type: 'music' | 'video'
  url?: string
  thumbnail_url?: string
  video_category?: string
  music_category?: string
}

class PlaylistService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
  }

  /**
   * Créer une nouvelle playlist
   */
  async create(data: {
    name: string
    description?: string
    is_public?: boolean
  }): Promise<Playlist> {
    const response = await axios.post(
      `${API_URL}/playlists`,
      data,
      this.getAuthHeaders()
    )
    return response.data
  }

  /**
   * Récupérer toutes les playlists de l'utilisateur
   */
  async getAll(): Promise<Playlist[]> {
    const response = await axios.get(
      `${API_URL}/playlists`,
      this.getAuthHeaders()
    )
    return response.data.data || []
  }

  /**
   * Récupérer une playlist par ID
   */
  async getById(id: number): Promise<Playlist> {
    const response = await axios.get(
      `${API_URL}/playlists/${id}`,
      this.getAuthHeaders()
    )
    return response.data
  }

  /**
   * Mettre à jour une playlist
   */
  async update(id: number, data: {
    name?: string
    description?: string
    is_public?: boolean
  }): Promise<Playlist> {
    const response = await axios.put(
      `${API_URL}/playlists/${id}`,
      data,
      this.getAuthHeaders()
    )
    return response.data
  }

  /**
   * Supprimer une playlist
   */
  async delete(id: number): Promise<void> {
    await axios.delete(
      `${API_URL}/playlists/${id}`,
      this.getAuthHeaders()
    )
  }

  /**
   * Ajouter un média à une playlist
   */
  async addMedia(playlistId: number, mediaId: number): Promise<void> {
    await axios.post(
      `${API_URL}/playlists/${playlistId}/media`,
      { media_id: mediaId },
      this.getAuthHeaders()
    )
  }

  /**
   * Retirer un média d'une playlist
   */
  async removeMedia(playlistId: number, mediaId: number): Promise<void> {
    await axios.delete(
      `${API_URL}/playlists/${playlistId}/media/${mediaId}`,
      this.getAuthHeaders()
    )
  }

  /**
   * Réorganiser les médias dans une playlist
   */
  async reorderMedia(playlistId: number, mediaId: number, newPosition: number): Promise<void> {
    await axios.put(
      `${API_URL}/playlists/${playlistId}/reorder`,
      { media_id: mediaId, position: newPosition },
      this.getAuthHeaders()
    )
  }
}

export const playlistService = new PlaylistService()






