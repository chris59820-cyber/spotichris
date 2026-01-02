import axios from 'axios'

import { API_URL } from '../config/api'

interface UploadMediaResponse {
  id: number
  title: string
  artist?: string
  album?: string
  description?: string
  duration?: number
  type: 'music' | 'video'
  url: string
  thumbnail_url?: string
  created_at: string
  updated_at: string
}

class UploadService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    const headers: any = {
      'Content-Type': 'multipart/form-data',
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    return { headers }
  }

  /**
   * Upload un fichier média (audio ou vidéo) et crée l'entrée dans la base de données
   */
  async uploadMedia(data: {
    title: string
    type: 'music' | 'video'
    file: File
    thumbnail?: File
    artist?: string
    album?: string
    description?: string
    duration?: number
    videoCategory?: string
    genre?: string
    musicCategory?: string
  }): Promise<UploadMediaResponse> {
    const formData = new FormData()
    
    formData.append('title', data.title)
    formData.append('type', data.type)
    formData.append('file', data.file)
    
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail)
    }
    
    if (data.artist) {
      formData.append('artist', data.artist)
    }
    
    if (data.album) {
      formData.append('album', data.album)
    }
    
    if (data.description) {
      formData.append('description', data.description)
    }
    
    if (data.duration) {
      formData.append('duration', data.duration.toString())
    }
    
    if (data.videoCategory) {
      formData.append('video_category', data.videoCategory)
    }
    
    if (data.genre) {
      formData.append('genre', data.genre)
    }
    
    if (data.musicCategory) {
      formData.append('music_category', data.musicCategory)
    }

    try {
      const response = await axios.post<UploadMediaResponse>(
        `${API_URL}/media`,
        formData,
        this.getAuthHeaders()
      )

      return response.data
    } catch (error: any) {
      // Améliorer le message d'erreur pour les erreurs réseau
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error') || (!error.response && error.request)) {
        throw new Error('Le serveur backend n\'est pas accessible. Assurez-vous qu\'il est démarré (npm run dev dans le dossier backend).')
      }
      throw error
    }
  }

  /**
   * Upload seulement le fichier (sans créer le média)
   */
  async uploadFile(data: {
    type: 'music' | 'video'
    file: File
    thumbnail?: File
  }): Promise<{ file_url: string; thumbnail_url?: string; filename: string }> {
    const formData = new FormData()
    
    formData.append('type', data.type)
    formData.append('file', data.file)
    
    if (data.thumbnail) {
      formData.append('thumbnail', data.thumbnail)
    }

    const response = await axios.post(
      `${API_URL}/upload`,
      formData,
      this.getAuthHeaders()
    )

    return response.data
  }
}

export const uploadService = new UploadService()

