import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth.middleware'
import { webSocketService } from '../services/websocket.service'

const router = Router()

/**
 * GET /api/carplay/now-playing
 * Retourne le média actuellement en lecture (format simplifié pour CarPlay/Android Auto)
 */
router.get('/now-playing', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const playbackState = webSocketService.getPlaybackState(userId)

    if (!playbackState) {
      return res.json({
        title: '',
        artist: '',
        album: '',
        duration: 0,
        currentTime: 0,
        isPlaying: false,
      })
    }

    return res.json({
      title: playbackState.mediaTitle || '',
      artist: playbackState.mediaArtist || '',
      album: playbackState.mediaAlbum || '',
      duration: playbackState.duration,
      currentTime: playbackState.currentTime,
      isPlaying: playbackState.isPlaying,
      mediaId: playbackState.mediaId,
      type: playbackState.mediaType,
    })
  } catch (error: any) {
    console.error('Error getting now playing:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * GET /api/carplay/queue
 * Retourne la file d'attente de lecture
 */
router.get('/queue', authenticateToken, async (req: Request, res: Response) => {
  try {
    // TODO: Récupérer la file d'attente depuis la session utilisateur
    return res.json({
      items: [],
      currentIndex: 0,
    })
  } catch (error: any) {
    console.error('Error getting queue:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

/**
 * POST /api/carplay/control
 * Contrôle la lecture (play, pause, next, previous, seek)
 */
router.post('/control', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { command, value } = req.body

    if (!command || !['play', 'pause', 'next', 'previous', 'seek'].includes(command)) {
      return res.status(400).json({ message: 'Commande invalide' })
    }

    // Envoyer la commande via WebSocket à l'utilisateur
    webSocketService.sendCommandToUser(userId, {
      command,
      value,
    })

    return res.json({
      success: true,
      message: `Commande ${command} envoyée`,
    })
  } catch (error: any) {
    console.error('Error executing control command:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

export default router

