import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
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

  const play = useCallback((media: MediaItem) => {
    const playerType: PlayerType = media.type === 'music' ? 'audio' : 'video'
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

  // Synchroniser avec CarPlay/Android Auto
  useEffect(() => {
    // Se connecter au service CarPlay
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
      carPlayService.disconnect()
    }
  }, [togglePlayPause, seek, currentlyPlaying])

  // Envoyer l'état de lecture à CarPlay/Android Auto
  useEffect(() => {
    if (currentlyPlaying) {
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
      // Envoyer l'état seulement si le service est connecté
      if (carPlayService.isConnected()) {
        carPlayService.sendPlaybackState(playbackState)
      }
    }
  }, [currentlyPlaying])

  const value: PlayerContextType = {
    currentlyPlaying,
    isPlaying: currentlyPlaying?.isPlaying || false,
    currentTime: currentlyPlaying?.currentTime || 0,
    duration: currentlyPlaying?.duration || 0,
    volume: currentlyPlaying?.volume ?? 1,
    play,
    pause,
    togglePlayPause,
    seek,
    setVolume,
    stop,
    updateTime,
    updateDuration,
    updateIsPlaying,
  }

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

