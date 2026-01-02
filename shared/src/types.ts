// Types partagés entre frontend et backend

export type MediaType = 'music' | 'video'

export interface User {
  id: number
  email: string
  username?: string
  created_at?: Date
  updated_at?: Date
}

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
  created_at?: Date
  updated_at?: Date
}

export interface Playlist {
  id: number
  user_id: number
  name: string
  description?: string
  is_public: boolean
  created_at?: Date
  updated_at?: Date
}







