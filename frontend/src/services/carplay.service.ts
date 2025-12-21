/**
 * Service pour la synchronisation avec CarPlay et Android Auto
 * 
 * Ce service permet de synchroniser l'état de lecture entre l'application web
 * et les applications natives CarPlay/Android Auto via WebSocket (Socket.IO).
 */

import { io, Socket } from 'socket.io-client'
import { MediaItem } from './media.service'

export interface PlaybackState {
  isPlaying: boolean
  currentTime: number
  duration: number
  media: MediaItem | null
  mediaId?: number | null
  mediaTitle?: string
  mediaArtist?: string
  mediaAlbum?: string
  mediaType?: 'music' | 'video'
}

export interface CarPlayCommand {
  command: 'play' | 'pause' | 'next' | 'previous' | 'seek'
  value?: number // Pour seek
}

class CarPlayService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private reconnectTimeout: NodeJS.Timeout | null = null

  /**
   * Se connecter au serveur WebSocket (Socket.IO) pour la synchronisation
   */
  connect(onStateUpdate?: (state: PlaybackState) => void, onCommand?: (command: CarPlayCommand) => void) {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('CarPlay/Android Auto: Pas de token, connexion impossible')
        return
      }

      const wsUrl = process.env.NODE_ENV === 'production' 
        ? 'wss://your-domain.com'
        : 'http://localhost:3000'
      
      this.socket = io(wsUrl, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      })

      this.socket.on('connect', () => {
        console.log('✅ CarPlay/Android Auto: Connecté via WebSocket')
        this.reconnectAttempts = 0
      })

      this.socket.on('playback_state', (state: PlaybackState) => {
        if (onStateUpdate) {
          onStateUpdate(state)
        }
      })

      this.socket.on('carplay_command', (command: CarPlayCommand) => {
        if (onCommand) {
          onCommand(command)
        }
      })

      this.socket.on('error', (error: { message: string }) => {
        console.error('❌ CarPlay/Android Auto WebSocket error:', error.message)
      })

      this.socket.on('disconnect', (reason: string) => {
        console.log(`🔌 CarPlay/Android Auto: Déconnecté (${reason})`)
        if (reason === 'io server disconnect') {
          // Le serveur a forcé la déconnexion, ne pas reconnecter automatiquement
          this.socket?.connect()
        }
      })

      this.socket.on('connect_error', (error: Error) => {
        console.error('❌ Erreur de connexion CarPlay/Android Auto:', error.message)
        this.reconnectAttempts++
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectTimeout = setTimeout(() => {
            if (this.socket && !this.socket.connected) {
              this.socket.connect()
            }
          }, this.reconnectDelay * this.reconnectAttempts)
        }
      })
    } catch (error) {
      console.error('❌ Erreur lors de la connexion au service CarPlay/Android Auto:', error)
    }
  }

  /**
   * Envoyer une commande de contrôle
   */
  sendCommand(command: CarPlayCommand) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('carplay_command', command)
    } else {
      console.warn('CarPlay/Android Auto: WebSocket non connecté')
    }
  }

  /**
   * Envoyer l'état de lecture actuel
   */
  sendPlaybackState(state: PlaybackState) {
    if (this.socket && this.socket.connected) {
      // Envoyer l'état complet avec l'objet media si disponible
      const payload = state.media 
        ? {
            isPlaying: state.isPlaying,
            currentTime: state.currentTime,
            duration: state.duration,
            media: state.media,
          }
        : {
            isPlaying: state.isPlaying,
            currentTime: state.currentTime,
            duration: state.duration,
            mediaId: state.mediaId || null,
            mediaTitle: state.mediaTitle,
            mediaArtist: state.mediaArtist,
            mediaAlbum: state.mediaAlbum,
            mediaType: state.mediaType,
          }
      this.socket.emit('playback_state_update', payload)
      console.log('📡 État de lecture envoyé:', payload)
    } else {
      console.warn('⚠️ WebSocket non connecté, impossible d\'envoyer l\'état')
    }
  }

  /**
   * Déconnecter
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * Vérifier si connecté
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.connected
  }
}

export const carPlayService = new CarPlayService()

