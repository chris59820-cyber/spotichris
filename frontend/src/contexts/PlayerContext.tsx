import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { MediaItem } from '../services/media.service'
import { carPlayService, PlaybackState } from '../services/carplay.service'

export type PlayerType = 'audio' | 'video' | null

export interface CurrentlyPlaying {
  media: MediaItem
  type: PlayerType
  currentTime: number
  duration: number
  isPlaying: boolean
  volume: number
}

interface PlayerContextType {
  // State
  currentlyPlaying: CurrentlyPlaying | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  queue: MediaItem[] // Liste d'attente

  // Actions
  play: (media: MediaItem) => void
  pause: () => void
  togglePlayPause: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  stop: () => void
  updateTime: (time: number) => void
  updateDuration: (duration: number) => void
  updateIsPlaying: (isPlaying: boolean) => void
  addToQueue: (media: MediaItem) => void
  removeFromQueue: (mediaId: number) => void
  clearQueue: () => void
  playNext: () => void
  playPrevious: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}

interface PlayerProviderProps {
  children: ReactNode
}

export const PlayerProvider: React.FC<PlayerProviderProps> = ({ children }) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<CurrentlyPlaying | null>(null)
  const [queue, setQueue] = useState<MediaItem[]>([]) // Liste d'attente

  const play = useCallback((media: MediaItem) => {
    const playerType: PlayerType = media.type === 'music' ? 'audio' : 'video'
    console.log('🎵 PlayerContext.play() called:', {
      mediaId: media.id,
      title: media.title,
      type: playerType,
      url: media.url,
    })
    setCurrentlyPlaying({
      media,
      type: playerType,
      currentTime: 0,
      duration: media.duration || 0,
      isPlaying: true,
      volume: currentlyPlaying?.volume || 1,
    })
  }, [currentlyPlaying?.volume])

  const pause = useCallback(() => {
    if (currentlyPlaying) {
      setCurrentlyPlaying({
        ...currentlyPlaying,
        isPlaying: false,
      })
    }
  }, [currentlyPlaying])

  const togglePlayPause = useCallback(() => {
    if (!currentlyPlaying) return

    if (currentlyPlaying.isPlaying) {
      pause()
    } else {
      setCurrentlyPlaying({
        ...currentlyPlaying,
        isPlaying: true,
      })
    }
  }, [currentlyPlaying, pause])

  const seek = useCallback((time: number) => {
    if (currentlyPlaying) {
      setCurrentlyPlaying({
        ...currentlyPlaying,
        currentTime: Math.max(0, Math.min(time, currentlyPlaying.duration)),
      })
    }
  }, [currentlyPlaying])

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    if (currentlyPlaying) {
      setCurrentlyPlaying({
        ...currentlyPlaying,
        volume: clampedVolume,
      })
    } else {
      // Store volume even when nothing is playing
      setCurrentlyPlaying({
        media: {} as MediaItem,
        type: null,
        currentTime: 0,
        duration: 0,
        isPlaying: false,
        volume: clampedVolume,
      })
    }
  }, [currentlyPlaying])

  const stop = useCallback(() => {
    setCurrentlyPlaying(null)
  }, [])

  const updateTime = useCallback((time: number) => {
    if (currentlyPlaying) {
      setCurrentlyPlaying({
        ...currentlyPlaying,
        currentTime: time,
      })
    }
  }, [currentlyPlaying])

  const updateDuration = useCallback((duration: number) => {
    if (currentlyPlaying) {
      setCurrentlyPlaying({
        ...currentlyPlaying,
        duration,
      })
    }
  }, [currentlyPlaying])

  const updateIsPlaying = useCallback((isPlaying: boolean) => {
    if (currentlyPlaying) {
      setCurrentlyPlaying({
        ...currentlyPlaying,
        isPlaying,
      })
    }
  }, [currentlyPlaying])

  // Ajouter un média à la liste d'attente
  const addToQueue = useCallback((media: MediaItem) => {
    setQueue((prevQueue) => {
      // Vérifier si le média n'est pas déjà dans la queue
      if (prevQueue.some((item) => item.id === media.id)) {
        return prevQueue
      }
      return [...prevQueue, media]
    })
  }, [])

  // Retirer un média de la liste d'attente
  const removeFromQueue = useCallback((mediaId: number) => {
    setQueue((prevQueue) => prevQueue.filter((item) => item.id !== mediaId))
  }, [])

  // Vider la liste d'attente
  const clearQueue = useCallback(() => {
    setQueue([])
  }, [])

  // Jouer le prochain média dans la queue
  const playNext = useCallback(() => {
    if (queue.length > 0) {
      const nextMedia = queue[0]
      setQueue((prevQueue) => prevQueue.slice(1)) // Retirer le premier élément
      play(nextMedia)
    }
  }, [queue, play])

  // Jouer le média précédent (pour l'instant, on ne garde pas l'historique)
  const playPrevious = useCallback(() => {
    // TODO: Implémenter l'historique si nécessaire
    console.log('Previous track - not implemented yet')
  }, [])

  // Synchroniser avec CarPlay/Android Auto - Se connecter une seule fois au montage
  useEffect(() => {
    // Se connecter au service CarPlay (une seule fois)
    carPlayService.connect(
      // Callback pour recevoir les mises à jour d'état (depuis d'autres clients)
      (state: PlaybackState) => {
        // Optionnel: synchroniser l'état si nécessaire
        // Pour l'instant, on garde l'état local comme source de vérité
      },
      // Callback pour recevoir les commandes depuis CarPlay/Android Auto
      (command: { command: string; value?: number }) => {
        switch (command.command) {
          case 'play':
            if (!currentlyPlaying?.isPlaying) {
              togglePlayPause()
            }
            break
          case 'pause':
            if (currentlyPlaying?.isPlaying) {
              togglePlayPause()
            }
            break
          case 'next':
            // TODO: Implémenter next track
            console.log('Next track command from CarPlay/Android Auto')
            break
          case 'previous':
            // TODO: Implémenter previous track
            console.log('Previous track command from CarPlay/Android Auto')
            break
          case 'seek':
            if (command.value !== undefined && currentlyPlaying) {
              seek(command.value)
            }
            break
        }
      }
    )

    return () => {
      // Ne déconnecter que lors du démontage complet du composant
      carPlayService.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Dépendances vides = exécuter une seule fois au montage

  // Envoyer l'état de lecture à CarPlay/Android Auto (avec debounce pour éviter les boucles)
  const previousStateRef = useRef<{ mediaId: number; isPlaying: boolean; currentTime: number } | null>(null)
  useEffect(() => {
    if (!currentlyPlaying) return

    const currentState = {
      mediaId: currentlyPlaying.media.id,
      isPlaying: currentlyPlaying.isPlaying,
      currentTime: Math.floor(currentlyPlaying.currentTime), // Arrondir pour éviter les mises à jour trop fréquentes
    }

    const previousState = previousStateRef.current

    // Ne mettre à jour que si quelque chose d'important a changé
    const hasChanged = !previousState ||
      previousState.mediaId !== currentState.mediaId ||
      previousState.isPlaying !== currentState.isPlaying ||
      Math.abs(previousState.currentTime - currentState.currentTime) >= 1 // Mettre à jour seulement toutes les secondes

    if (hasChanged && carPlayService.isConnected()) {
      const playbackState: PlaybackState = {
        isPlaying: currentlyPlaying.isPlaying,
        currentTime: currentlyPlaying.currentTime,
        duration: currentlyPlaying.duration,
        media: currentlyPlaying.media,
        mediaId: currentlyPlaying.media.id,
        mediaTitle: currentlyPlaying.media.title,
        mediaArtist: currentlyPlaying.media.artist,
        mediaAlbum: currentlyPlaying.media.album,
        mediaType: currentlyPlaying.media.type,
      }
      carPlayService.sendPlaybackState(playbackState)
      previousStateRef.current = currentState
    }
  }, [currentlyPlaying?.media.id, currentlyPlaying?.isPlaying, Math.floor(currentlyPlaying?.currentTime || 0)])

  const value: PlayerContextType = {
    currentlyPlaying,
    isPlaying: currentlyPlaying?.isPlaying || false,
    currentTime: currentlyPlaying?.currentTime || 0,
    duration: currentlyPlaying?.duration || 0,
    volume: currentlyPlaying?.volume ?? 1,
    queue,
    play,
    pause,
    togglePlayPause,
    seek,
    setVolume,
    stop,
    updateTime,
    updateDuration,
    updateIsPlaying,
    addToQueue,
    removeFromQueue,
    clearQueue,
    playNext,
    playPrevious,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

