import { Server as SocketIOServer, Socket } from 'socket.io'
import { verifyToken } from '../config/jwt.js'

export interface PlaybackState {
  userId: number
  isPlaying: boolean
  currentTime: number
  duration: number
  mediaId: number | null
  mediaTitle?: string
  mediaArtist?: string
  mediaAlbum?: string
  mediaType?: 'music' | 'video'
}

export interface CarPlayCommand {
  command: 'play' | 'pause' | 'next' | 'previous' | 'seek'
  value?: number
}

class WebSocketService {
  private io: SocketIOServer | null = null
  private userSockets: Map<number, Set<string>> = new Map() // userId -> Set of socketIds
  private socketUsers: Map<string, number> = new Map() // socketId -> userId
  private playbackStates: Map<number, PlaybackState> = new Map() // userId -> playbackState

  initialize(server: any) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    })

    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 Nouvelle connexion WebSocket: ${socket.id}`)

      // Authentification via token dans la query string ou handshake
      const token = socket.handshake.auth?.token || socket.handshake.query?.token as string

      if (!token) {
        console.log(`❌ Connexion rejetée: pas de token pour ${socket.id}`)
        socket.emit('error', { message: 'Token d\'authentification requis' })
        socket.disconnect()
        return
      }

      try {
        const decoded = verifyToken(token) as { userId: number }
        const userId = decoded.userId

        // Associer le socket à l'utilisateur
        this.socketUsers.set(socket.id, userId)
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set())
        }
        this.userSockets.get(userId)!.add(socket.id)

        console.log(`✅ Utilisateur ${userId} connecté via socket ${socket.id}`)

        // Envoyer l'état de lecture actuel si disponible
        const currentState = this.playbackStates.get(userId)
        if (currentState) {
          socket.emit('playback_state', currentState)
        }

        // Écouter les événements de l'application web
        socket.on('playback_state_update', (state: PlaybackState) => {
          this.handlePlaybackStateUpdate(userId, state)
        })

        // Écouter les commandes depuis CarPlay/Android Auto
        socket.on('carplay_command', (command: CarPlayCommand) => {
          this.handleCarPlayCommand(userId, command)
        })

        // Gérer la déconnexion
        socket.on('disconnect', () => {
          this.handleDisconnect(socket.id, userId)
        })

        // Événements de ping/pong pour maintenir la connexion
        socket.on('ping', () => {
          socket.emit('pong')
        })
      } catch (error: any) {
        console.error(`❌ Erreur d'authentification pour ${socket.id}:`, error.message)
        socket.emit('error', { message: 'Token invalide' })
        socket.disconnect()
      }
    })

    console.log('✅ Service WebSocket initialisé')
  }

  private handlePlaybackStateUpdate(userId: number, state: any) {
    // Normaliser l'état reçu (peut contenir un objet media ou des champs séparés)
    const normalizedState: PlaybackState = {
      userId,
      isPlaying: state.isPlaying,
      currentTime: state.currentTime,
      duration: state.duration,
      mediaId: state.media?.id || state.mediaId || null,
      mediaTitle: state.media?.title || state.mediaTitle,
      mediaArtist: state.media?.artist || state.mediaArtist,
      mediaAlbum: state.media?.album || state.mediaAlbum,
      mediaType: state.media?.type || state.mediaType,
    }

    // Mettre à jour l'état de lecture pour cet utilisateur
    this.playbackStates.set(userId, normalizedState)

    // Diffuser l'état à tous les sockets de cet utilisateur (web + mobile)
    const userSocketIds = this.userSockets.get(userId)
    if (userSocketIds) {
      userSocketIds.forEach((socketId) => {
        const socket = this.io?.sockets.sockets.get(socketId)
        if (socket && socket.id !== state.socketId) { // Ne pas renvoyer à l'expéditeur
          socket.emit('playback_state', normalizedState)
        }
      })
    }

    console.log(`📡 État de lecture mis à jour pour l'utilisateur ${userId}: ${normalizedState.isPlaying ? 'Lecture' : 'Pause'} - ${normalizedState.mediaTitle || 'Aucun média'}`)
  }

  private handleCarPlayCommand(userId: number, command: CarPlayCommand) {
    console.log(`🎮 Commande CarPlay/Android Auto reçue: ${command.command} pour l'utilisateur ${userId}`)

    // Diffuser la commande à tous les sockets de l'utilisateur (principalement l'application web)
    const userSocketIds = this.userSockets.get(userId)
    if (userSocketIds) {
      userSocketIds.forEach((socketId) => {
        const socket = this.io?.sockets.sockets.get(socketId)
        if (socket) {
          socket.emit('carplay_command', command)
        }
      })
    }
  }

  private handleDisconnect(socketId: string, userId: number) {
    console.log(`🔌 Déconnexion: socket ${socketId} (utilisateur ${userId})`)

    // Retirer le socket de la liste de l'utilisateur
    const userSocketIds = this.userSockets.get(userId)
    if (userSocketIds) {
      userSocketIds.delete(socketId)
      if (userSocketIds.size === 0) {
        this.userSockets.delete(userId)
        // Optionnel: nettoyer l'état de lecture après un délai
      }
    }

    this.socketUsers.delete(socketId)
  }

  // Méthode publique pour envoyer une commande à un utilisateur (depuis l'API REST)
  sendCommandToUser(userId: number, command: CarPlayCommand) {
    const userSocketIds = this.userSockets.get(userId)
    if (userSocketIds) {
      userSocketIds.forEach((socketId) => {
        const socket = this.io?.sockets.sockets.get(socketId)
        if (socket) {
          socket.emit('carplay_command', command)
        }
      })
    }
  }

  // Méthode publique pour obtenir l'état de lecture d'un utilisateur
  getPlaybackState(userId: number): PlaybackState | null {
    return this.playbackStates.get(userId) || null
  }

  // Méthode publique pour obtenir le nombre de connexions actives
  getActiveConnections(): number {
    return this.socketUsers.size
  }

  // Méthode publique pour obtenir le nombre d'utilisateurs connectés
  getConnectedUsers(): number {
    return this.userSockets.size
  }
}

export const webSocketService = new WebSocketService()

