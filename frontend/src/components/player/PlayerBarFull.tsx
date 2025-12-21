import React, { useState, useRef, useEffect } from 'react'
import { usePlayer } from '../../contexts/PlayerContext'
import { useAuth } from '../../features/auth/AuthContext'
import { favoritesService } from '../../services/favorites.service'
import { theme } from '../../styles/theme'
import { useCrossfade } from '../../hooks/useCrossfade'
import { useEqualizer } from '../../hooks/useEqualizer'
import { useCarMode } from '../../hooks/useCarMode'
import { useSmartSpeakers } from '../../hooks/useSmartSpeakers'
import { normalizeMediaUrl } from '../../utils/urlUtils'
import Equalizer from '../audio/Equalizer'
import AudioVisualizer from '../audio/AudioVisualizer'
import CarModeOverlay from '../audio/CarModeOverlay'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import AddToPlaylistModal from '../playlist/AddToPlaylistModal'

const PlayerBarFull: React.FC = () => {
  const {
    currentlyPlaying,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    seek,
    setVolume,
    updateTime,
    updateDuration,
    updateIsPlaying,
    play,
    pause,
    playNext,
    queue,
    removeFromQueue,
    clearQueue,
  } = usePlayer()
  const { isAuthenticated } = useAuth()
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isShuffling, setIsShuffling] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off')
  const [isFavorite, setIsFavorite] = useState(false)
  const [togglingFavorite, setTogglingFavorite] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [showEqualizer, setShowEqualizer] = useState(false)
  const [showDeviceMenu, setShowDeviceMenu] = useState(false)
  const [showQueueModal, setShowQueueModal] = useState(false)
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false)
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null)
  const [crossfadeEnabled, setCrossfadeEnabled] = useState(false)
  const [crossfadeDuration, setCrossfadeDuration] = useState(3)
  
  // AudioContext pour l'égaliseur
  const audioContextRef = useRef<AudioContext | null>(null)
  
  // Initialiser AudioContext
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => {
      // Ne pas fermer le contexte pour éviter les problèmes de réinitialisation
    }
  }, [])
  
  // Hooks pour les fonctionnalités avancées
  const { fadeIn, fadeOut, crossfade } = useCrossfade(
    audioRef.current,
    isPlaying && currentlyPlaying?.type === 'audio',
    { duration: crossfadeDuration, fadeIn: crossfadeEnabled, fadeOut: crossfadeEnabled }
  )
  const equalizer = useEqualizer(audioContextRef.current)
  const { settings: carModeSettings, toggle: toggleCarMode, isEnabled: isCarMode } = useCarMode()
  const { devices, isAvailable: speakersAvailable, isConnected: speakerConnected, currentDevice, connect: connectSpeaker, disconnect: disconnectSpeaker, cast } = useSmartSpeakers()
  
  // Gérer le crossfade lors du changement de média
  const previousMediaIdRef = useRef<number | null>(null)
  const previousAudioRef = useRef<HTMLAudioElement | null>(null)
  
  useEffect(() => {
    if (currentlyPlaying?.type === 'audio' && audioRef.current && crossfadeEnabled) {
      const currentMediaId = currentlyPlaying.media.id
      
      // Si c'est un nouveau média et qu'on avait un média précédent
      if (previousMediaIdRef.current !== null && previousMediaIdRef.current !== currentMediaId && previousAudioRef.current && audioRef.current) {
        // Effectuer le crossfade
        crossfade(previousAudioRef.current, audioRef.current, () => {
          // Callback après le crossfade
          if (previousAudioRef.current) {
            previousAudioRef.current.pause()
            previousAudioRef.current.src = ''
          }
        })
      }
      
      previousMediaIdRef.current = currentMediaId
      previousAudioRef.current = audioRef.current
    }
  }, [currentlyPlaying?.media.id, crossfadeEnabled])
  
  // Initialiser l'égaliseur quand l'élément audio change (une seule fois)
  // DÉSACTIVÉ TEMPORAIREMENT pour déboguer le problème de son
  // useEffect(() => {
  //   if (audioRef.current && audioContextRef.current && currentlyPlaying?.type === 'audio') {
  //     // Vérifier si l'égaliseur n'a pas déjà été initialisé pour cet élément
  //     const isInitialized = audioRef.current.getAttribute('data-equalizer-initialized') === 'true'
  //     if (!isInitialized) {
  //       try {
  //         equalizer.initialize(audioRef.current)
  //       } catch (error) {
  //         // Ignorer les erreurs de double connexion
  //         console.warn('Equalizer initialization warning:', error)
  //       }
  //     }
  //   }
  // }, [currentlyPlaying?.media.id, equalizer])

  // Charger le statut favori
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (currentlyPlaying && isAuthenticated) {
        try {
          const status = await favoritesService.getFavoriteStatus(currentlyPlaying.media.id)
          setIsFavorite(status.is_favorite)
        } catch (error) {
          console.error('Error loading favorite status:', error)
        }
      }
    }
    loadFavoriteStatus()
  }, [currentlyPlaying?.media.id, isAuthenticated])

  // Gérer la lecture audio
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentlyPlaying || currentlyPlaying.type !== 'audio') return

    const currentUrl = currentlyPlaying.media.url
    if (!currentUrl) {
      console.warn('No URL for audio media:', currentlyPlaying.media)
      return
    }

    // Normaliser l'URL pour utiliser le proxy Vite
    const fullUrl = normalizeMediaUrl(currentUrl)
    console.log('Audio URL conversion:', currentUrl, '->', fullUrl)

    // Normaliser l'URL pour la comparaison
    const normalizeUrl = (url: string) => {
      try {
        // Si c'est une URL absolue, utiliser son pathname
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return new URL(url).pathname
        }
        // Sinon, c'est une URL relative, la retourner telle quelle
        return url
      } catch {
        return url
      }
    }

    const currentNormalizedUrl = normalizeUrl(fullUrl)
    const audioNormalizedUrl = audio.src ? normalizeUrl(audio.src) : ''
    
    // Vérifier si l'URL a changé
    if (audioNormalizedUrl !== currentNormalizedUrl) {
      // Nouveau média, charger immédiatement (pas de setTimeout qui peut causer des saccades)
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      
      // Charger la nouvelle source immédiatement
      audio.src = fullUrl
      audio.preload = 'auto' // Précharger pour éviter les saccades
      audio.load()
    }

    // Gérer la lecture
    if (isPlaying) {
      const playAudio = async () => {
        try {
          // Attendre que le média soit prêt avant de jouer
          if (audio.readyState < 2) {
            await new Promise<void>((resolve) => {
              const handleCanPlay = () => {
                audio.removeEventListener('canplay', handleCanPlay)
                audio.removeEventListener('loadeddata', handleCanPlay)
                resolve()
              }
              audio.addEventListener('canplay', handleCanPlay, { once: true })
              audio.addEventListener('loadeddata', handleCanPlay, { once: true })
            })
          }
          
          await audio.play()
        } catch (error) {
          console.error('Error playing audio:', error)
          updateIsPlaying(false)
        }
      }

      playAudio()
    } else {
      audio.pause()
    }

    // S'assurer que le volume est correctement défini
    const finalVolume = volume > 0 ? volume : 0.5
    if (Math.abs(audio.volume - finalVolume) > 0.01) { // Éviter les mises à jour inutiles
      audio.volume = finalVolume
    }
    
    // S'assurer que l'audio n'est pas muet
    if (audio.muted) {
      audio.muted = false
    }

    // Utiliser requestAnimationFrame pour réduire la fréquence des mises à jour et éviter les saccades
    let rafId: number | null = null
    const handleTimeUpdate = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          updateTime(audio.currentTime)
          rafId = null
        })
      }
    }
    
    const handleLoadedMetadata = () => {
      updateDuration(audio.duration || 0)
    }
    
    const handleEnded = () => {
      updateIsPlaying(false)
      updateTime(0)
      
      // Gérer le mode de répétition
      if (repeatMode === 'one') {
        // Rejouer le même média
        if (audioRef.current) {
          audioRef.current.currentTime = 0
          audioRef.current.play().catch((error) => {
            console.error('Error replaying audio:', error)
          })
        }
      } else if (repeatMode === 'all' && queue.length === 0) {
        // Si mode répétition "all" et queue vide, rejouer le même média
        if (audioRef.current) {
          audioRef.current.currentTime = 0
          audioRef.current.play().catch((error) => {
            console.error('Error replaying audio:', error)
          })
        }
      } else {
        // Jouer le prochain média de la queue
        if (queue.length > 0) {
          playNext()
        }
      }
    }
    
    const handlePlay = () => updateIsPlaying(true)
    const handlePause = () => updateIsPlaying(false)
    
    const handleError = (e: Event) => {
      console.error('Audio element error:', e, audio.error)
      updateIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('error', handleError)

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('error', handleError)
    }
  }, [currentlyPlaying?.media.id, currentlyPlaying?.media.url, isPlaying, volume, updateTime, updateDuration, updateIsPlaying, setVolume, repeatMode, queue, playNext])

  // Gérer la lecture vidéo
  useEffect(() => {
    const video = videoRef.current
    if (!video || !currentlyPlaying || currentlyPlaying.type !== 'video') return

    const currentUrl = currentlyPlaying.media.url
    if (!currentUrl) {
      console.warn('No URL for video media:', currentlyPlaying.media)
      return
    }

    // Normaliser l'URL pour utiliser le proxy Vite
    const fullUrl = normalizeMediaUrl(currentUrl)
    console.log('Video URL conversion:', currentUrl, '->', fullUrl)

    // Normaliser l'URL pour la comparaison
    const normalizeUrl = (url: string) => {
      try {
        // Si c'est une URL absolue, utiliser son pathname
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return new URL(url).pathname
        }
        // Sinon, c'est une URL relative, la retourner telle quelle
        return url
      } catch {
        return url
      }
    }

    const currentNormalizedUrl = normalizeUrl(fullUrl)
    const videoNormalizedUrl = video.src ? normalizeUrl(video.src) : ''
    
    // Vérifier si l'URL a changé
    if (videoNormalizedUrl !== currentNormalizedUrl) {
      // Nouveau média, charger
      console.log('Loading video:', fullUrl)
      console.log('Video element:', video)
      console.log('Video readyState before load:', video.readyState)
      
      // Réinitialiser l'élément vidéo
      video.pause()
      video.src = ''
      video.load()
      
      // Attendre un peu avant de charger la nouvelle source
      setTimeout(() => {
        video.src = fullUrl
        video.load()
        console.log('Video src set to:', fullUrl)
        console.log('Video readyState after load:', video.readyState)
        
        // Vérifier si le fichier est accessible
        fetch(fullUrl, { method: 'HEAD' })
          .then((response) => {
            console.log('Video file accessibility check:', response.status, response.ok)
            if (!response.ok) {
              console.error('Video file not accessible:', response.status, response.statusText)
            }
          })
          .catch((error) => {
            console.error('Error checking video file accessibility:', error)
          })
      }, 100)
    }

    // Gérer la lecture
    if (isPlaying) {
      const playVideo = () => {
        console.log('Attempting to play video:', fullUrl, 'readyState:', video.readyState, 'volume:', video.volume)
        video.play().then(() => {
          console.log('Video playing successfully')
        }).catch((error) => {
          console.error('Error playing video:', error)
          updateIsPlaying(false)
        })
      }

      // Si le média est déjà chargé, jouer immédiatement
      if (video.readyState >= 2) {
        playVideo()
      } else {
        // Attendre que le média soit prêt
        const handleCanPlay = () => {
          console.log('Video can play, starting playback')
          playVideo()
          video.removeEventListener('canplay', handleCanPlay)
          video.removeEventListener('loadeddata', handleCanPlay)
        }
        video.addEventListener('canplay', handleCanPlay)
        video.addEventListener('loadeddata', handleCanPlay)
      }
    } else {
      video.pause()
    }

    // S'assurer que le volume est correctement défini et que la vidéo n'est pas muette
    const finalVolume = volume > 0 ? volume : 0.5
    if (video.volume !== finalVolume) {
      console.log('Setting video volume to:', finalVolume)
      video.volume = finalVolume
      if (volume === 0) {
        setVolume(0.5)
      }
    }
    
    // S'assurer que la vidéo n'est pas muette
    if (video.muted) {
      console.warn('Video is muted, unmuting')
      video.muted = false
    }

    const handleTimeUpdate = () => updateTime(video.currentTime)
    const handleLoadedMetadata = () => {
      console.log('Video metadata loaded, duration:', video.duration)
      updateDuration(video.duration || 0)
    }
    const handleEnded = () => {
      updateIsPlaying(false)
      updateTime(0)
      
      // Gérer le mode de répétition
      if (repeatMode === 'one') {
        // Rejouer le même média
        if (videoRef.current) {
          videoRef.current.currentTime = 0
          videoRef.current.play().catch((error) => {
            console.error('Error replaying video:', error)
          })
        }
      } else if (repeatMode === 'all' && queue.length === 0) {
        // Si mode répétition "all" et queue vide, rejouer le même média
        if (videoRef.current) {
          videoRef.current.currentTime = 0
          videoRef.current.play().catch((error) => {
            console.error('Error replaying video:', error)
          })
        }
      } else {
        // Jouer le prochain média de la queue
        if (queue.length > 0) {
          playNext()
        }
      }
    }
    const handlePlay = () => {
      console.log('Video play event fired')
      updateIsPlaying(true)
    }
    const handlePause = () => {
      console.log('Video pause event fired')
      updateIsPlaying(false)
    }
    const handleError = (e: Event) => {
      console.error('Video element error:', e, video.error)
      if (video.error) {
        console.error('Video error details:', {
          code: video.error.code,
          message: video.error.message,
        })
      }
      updateIsPlaying(false)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('error', handleError)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('error', handleError)
    }
  }, [currentlyPlaying, isPlaying, volume, updateTime, updateDuration, updateIsPlaying, repeatMode, queue, playNext])

  const handleSeek = (time: number) => {
    seek(time)
    if (audioRef.current && currentlyPlaying?.type === 'audio') {
      audioRef.current.currentTime = time
    }
    if (videoRef.current && currentlyPlaying?.type === 'video') {
      videoRef.current.currentTime = time
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) audioRef.current.volume = newVolume
    if (videoRef.current) videoRef.current.volume = newVolume
  }

  const handlePrevious = () => {
    // TODO: Implémenter la fonctionnalité précédent
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }

  const handleNext = () => {
    // TODO: Implémenter la fonctionnalité suivant avec queue
    // Pour l'instant, on réinitialise simplement
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }
  
  // Gérer le cast vers un appareil
  const handleCast = async (deviceId: string) => {
    if (!currentlyPlaying?.media.url) return
    try {
      await connectSpeaker(deviceId)
      await cast(currentlyPlaying.media.url, {
        title: currentlyPlaying.media.title,
        artist: currentlyPlaying.media.artist,
        thumbnail: currentlyPlaying.media.thumbnail_url,
      })
      setShowDeviceMenu(false)
    } catch (error) {
      console.error('Error casting to device:', error)
    }
  }
  
  // Gérer la déconnexion d'un appareil
  const handleDisconnectSpeaker = async () => {
    try {
      await disconnectSpeaker()
      setShowDeviceMenu(false)
    } catch (error) {
      console.error('Error disconnecting speaker:', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!currentlyPlaying || !isAuthenticated) return
    setTogglingFavorite(true)
    try {
      const result = await favoritesService.toggleFavorite(currentlyPlaying.media.id)
      setIsFavorite(result.is_favorite)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setTogglingFavorite(false)
    }
  }

  const handleFullscreen = () => {
    if (videoRef.current && currentlyPlaying?.type === 'video') {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        videoRef.current.requestFullscreen().catch((err) => {
          console.error('Error attempting to enable fullscreen:', err)
        })
      }
    }
  }

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!currentlyPlaying) {
    return null
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const playerBarStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '90px',
    backgroundColor: theme.colors.bgSecondary,
    borderTop: `1px solid ${theme.colors.borderPrimary}`,
    padding: `0 ${theme.spacing.lg}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.lg,
    zIndex: theme.zIndex.fixed,
    boxShadow: theme.shadows.lg,
  }

  const leftSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: '0 0 30%',
    minWidth: 0,
  }

  const thumbnailStyle: React.CSSProperties = {
    width: '56px',
    height: '56px',
    borderRadius: theme.borderRadius.sm,
    objectFit: 'cover',
    backgroundColor: theme.colors.bgTertiary,
    flexShrink: 0,
  }

  const infoStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  }

  const titleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes.base,
    fontWeight: 600,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs / 2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }

  const artistStyle: React.CSSProperties = {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }

  const centerSectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
    maxWidth: '722px',
    minWidth: 0,
  }

  const controlsRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
  }

  const controlButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: 'none',
    color: theme.colors.textSecondary,
    cursor: 'pointer',
    padding: theme.spacing.xs,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.fontSizes.lg,
    transition: theme.transitions.base,
    borderRadius: theme.borderRadius.full,
  }

  const playButtonStyle: React.CSSProperties = {
    ...controlButtonStyle,
    backgroundColor: theme.colors.textPrimary,
    color: theme.colors.bgPrimary,
    width: '32px',
    height: '32px',
    fontSize: theme.fontSizes.base,
  }

  const progressBarStyle: React.CSSProperties = {
    width: '100%',
    height: '6px',
    backgroundColor: theme.colors.bgTertiary,
    borderRadius: theme.borderRadius.full,
    position: 'relative',
    cursor: 'pointer',
    transition: 'height 0.2s ease',
  }

  const progressFillStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: theme.colors.textPrimary,
    borderRadius: theme.borderRadius.full,
    width: `${progressPercent}%`,
    transition: 'width 0.1s linear',
    position: 'relative',
  }

  const progressHandleStyle: React.CSSProperties = {
    position: 'absolute',
    right: '-6px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: theme.colors.textPrimary,
    border: `2px solid ${theme.colors.bgPrimary}`,
    cursor: 'grab',
    opacity: 0,
    transition: 'opacity 0.2s ease',
    boxShadow: theme.shadows.glow,
  }

  const progressIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${progressPercent}%`,
    top: '-8px',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderBottom: `8px solid ${theme.colors.textPrimary}`,
    opacity: 1,
    transition: 'left 0.1s linear',
    pointerEvents: 'none',
  }

  const timeStyle: React.CSSProperties = {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    minWidth: '40px',
  }

  const rightSectionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: '0 0 30%',
    justifyContent: 'flex-end',
  }

  return (
    <CarModeOverlay isEnabled={isCarMode}>
      {currentlyPlaying.type === 'audio' && (
        <audio 
          ref={audioRef} 
          preload="metadata" 
          crossOrigin="anonymous"
          onError={(e) => {
            console.error('Audio element error event:', e, audioRef.current?.error)
          }}
        />
      )}
      {currentlyPlaying.type === 'video' && (
        <video 
          ref={videoRef} 
          preload="metadata" 
          style={{ display: 'none' }}
          crossOrigin="anonymous"
          onError={(e) => {
            console.error('Video element error event:', e, videoRef.current?.error)
          }}
        />
      )}
      
      <div style={playerBarStyle}>
        {/* Section gauche - Info média */}
        <div style={leftSectionStyle}>
          {currentlyPlaying.media.thumbnail_url ? (
            <img
              src={currentlyPlaying.media.thumbnail_url}
              alt={currentlyPlaying.media.title}
              style={thumbnailStyle}
            />
          ) : (
            <div
              style={{
                ...thumbnailStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: theme.fontSizes['2xl'],
              }}
            >
              {currentlyPlaying.type === 'audio' ? '🎵' : '🎬'}
            </div>
          )}
          <div style={infoStyle}>
            <div style={titleStyle}>
              {currentlyPlaying.media.title}
              {currentlyPlaying.type === 'video' && (
                <span style={{ marginLeft: theme.spacing.xs, fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary }}>
                  • Vidéo
                </span>
              )}
            </div>
            <div style={artistStyle}>
              {currentlyPlaying.media.artist || 'Artiste inconnu'}
            </div>
          </div>
          {isAuthenticated && (
            <button
              onClick={handleToggleFavorite}
              disabled={togglingFavorite}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: isFavorite ? theme.colors.primary : theme.colors.textSecondary,
                cursor: 'pointer',
                fontSize: theme.fontSizes.lg,
                padding: theme.spacing.xs,
                transition: theme.transitions.base,
              }}
              title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            >
              {togglingFavorite ? '⏳' : isFavorite ? '✓' : '+'}
            </button>
          )}
        </div>

        {/* Section centrale - Contrôles */}
        <div style={centerSectionStyle}>
          <div style={controlsRowStyle}>
            <button
              style={{
                ...controlButtonStyle,
                color: isShuffling ? theme.colors.primary : theme.colors.textSecondary,
              }}
              onClick={() => setIsShuffling(!isShuffling)}
              title="Mélanger"
            >
              🔀
            </button>
            <button
              style={controlButtonStyle}
              onClick={handlePrevious}
              title="Précédent"
            >
              ⏮
            </button>
            <button
              style={playButtonStyle}
              onClick={togglePlayPause}
              title={isPlaying ? 'Pause' : 'Lecture'}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              style={controlButtonStyle}
              onClick={handleNext}
              title="Suivant"
            >
              ⏭
            </button>
            <button
              style={{
                ...controlButtonStyle,
                color: repeatMode !== 'off' ? theme.colors.primary : theme.colors.textSecondary,
              }}
              onClick={() => {
                const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one']
                const currentIndex = modes.indexOf(repeatMode)
                setRepeatMode(modes[(currentIndex + 1) % modes.length])
              }}
              title={repeatMode === 'off' ? 'Répéter' : repeatMode === 'all' ? 'Répéter la liste' : 'Répéter une fois'}
            >
              {repeatMode === 'off' ? '🔁' : repeatMode === 'all' ? '🔁' : '🔂'}
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, width: '100%' }}>
            <span style={timeStyle}>{formatTime(currentTime)}</span>
            <div
              style={progressBarStyle}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const percent = (e.clientX - rect.left) / rect.width
                handleSeek(percent * duration)
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.height = '8px'
                const handle = e.currentTarget.querySelector('[data-progress-handle]') as HTMLElement
                if (handle) handle.style.opacity = '1'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.height = '6px'
                const handle = e.currentTarget.querySelector('[data-progress-handle]') as HTMLElement
                if (handle) handle.style.opacity = '0'
              }}
            >
              <div style={progressFillStyle}>
                <div style={progressHandleStyle} data-progress-handle />
              </div>
              <div style={progressIndicatorStyle} />
            </div>
            <span style={timeStyle}>{formatTime(duration)}</span>
          </div>
          {/* Égaliseur graphique - côté droit du centre */}
          {currentlyPlaying.type === 'audio' && audioRef.current && (
            <div style={{
              position: 'absolute',
              left: '100%',
              marginLeft: theme.spacing.lg,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              zIndex: 1,
            }}>
              <AudioVisualizer
                audioElement={audioRef.current}
                audioContext={audioContextRef.current}
                isPlaying={isPlaying}
                width={300}
                height={60}
                barCount={30}
              />
            </div>
          )}
        </div>

        {/* Section droite - Contrôles supplémentaires */}
        <div style={rightSectionStyle}>
          <button
            style={controlButtonStyle}
            title="Paroles"
          >
            🎤
          </button>
          <button
            style={{
              ...controlButtonStyle,
              color: queue.length > 0 ? theme.colors.primary : theme.colors.textSecondary,
            }}
            onClick={() => setShowQueueModal(true)}
            title={`File d'attente (${queue.length})`}
          >
            ☰
          </button>
          {/* Égaliseur */}
          {currentlyPlaying.type === 'audio' && (
            <button
              style={{
                ...controlButtonStyle,
                color: equalizer.isEnabled ? theme.colors.primary : theme.colors.textSecondary,
              }}
              onClick={() => setShowEqualizer(true)}
              title="Égaliseur"
            >
              🎚️
            </button>
          )}
          {/* Mode voiture */}
          <button
            style={{
              ...controlButtonStyle,
              color: isCarMode ? theme.colors.primary : theme.colors.textSecondary,
            }}
            onClick={toggleCarMode}
            title="Mode voiture"
          >
            🚗
          </button>
          {/* Enceintes connectées */}
          <div style={{ position: 'relative' }}>
            <button
              style={{
                ...controlButtonStyle,
                color: speakerConnected ? theme.colors.primary : theme.colors.textSecondary,
              }}
              onClick={() => setShowDeviceMenu(!showDeviceMenu)}
              title={speakerConnected ? `Connecté à ${currentDevice?.name}` : 'Connecter à un appareil'}
              disabled={!speakersAvailable}
            >
              📺
            </button>
            {showDeviceMenu && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: 0,
                  marginBottom: theme.spacing.sm,
                  backgroundColor: theme.colors.bgPrimary,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.borderPrimary}`,
                  boxShadow: theme.shadows.lg,
                  padding: theme.spacing.sm,
                  minWidth: '200px',
                  zIndex: theme.zIndex.dropdown,
                }}
                onMouseLeave={() => setShowDeviceMenu(false)}
              >
                {speakerConnected && currentDevice ? (
                  <>
                    <div style={{ padding: theme.spacing.sm, color: theme.colors.textPrimary, fontSize: theme.fontSizes.sm }}>
                      Connecté à: {currentDevice.name}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleDisconnectSpeaker}
                      style={{ width: '100%', marginTop: theme.spacing.xs }}
                    >
                      Déconnecter
                    </Button>
                  </>
                ) : (
                  <>
                    <div style={{ padding: theme.spacing.sm, color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm, marginBottom: theme.spacing.xs }}>
                      Appareils disponibles:
                    </div>
                    {devices.length === 0 ? (
                      <div style={{ padding: theme.spacing.sm, color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs }}>
                        Aucun appareil disponible
                      </div>
                    ) : (
                      devices.map((device) => (
                        <button
                          key={device.id}
                          onClick={() => handleCast(device.id)}
                          style={{
                            width: '100%',
                            padding: theme.spacing.sm,
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: theme.colors.textPrimary,
                            textAlign: 'left',
                            cursor: 'pointer',
                            borderRadius: theme.borderRadius.sm,
                            fontSize: theme.fontSizes.sm,
                            marginBottom: theme.spacing.xs,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.bgTertiary
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          {device.type === 'chromecast' ? '📺' : device.type === 'airplay' ? '📱' : '🔊'} {device.name}
                        </button>
                      ))
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              position: 'relative',
            }}
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              style={controlButtonStyle}
              title="Volume"
            >
              {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
            </button>
            {showVolumeSlider && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: 0,
                  width: '120px',
                  height: '32px',
                  backgroundColor: theme.colors.bgPrimary,
                  borderRadius: theme.borderRadius.md,
                  padding: theme.spacing.sm,
                  boxShadow: theme.shadows.lg,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    height: '4px',
                    cursor: 'pointer',
                  }}
                />
              </div>
            )}
          </div>
          {currentlyPlaying.type === 'video' && (
            <button
              style={controlButtonStyle}
              onClick={handleFullscreen}
              title="Plein écran"
            >
              ⛶
            </button>
          )}
        </div>
      </div>
      
      {/* Modal Égaliseur */}
      {showEqualizer && currentlyPlaying.type === 'audio' && (
        <Modal
          isOpen={showEqualizer}
          onClose={() => setShowEqualizer(false)}
          title="Égaliseur Audio"
          size="lg"
        >
          <Equalizer
            audioContext={audioContextRef.current}
            audioElement={audioRef.current}
            onClose={() => setShowEqualizer(false)}
          />
          
          {/* Paramètres Crossfade */}
          <div style={{ marginTop: theme.spacing.lg, padding: theme.spacing.md, backgroundColor: theme.colors.bgTertiary, borderRadius: theme.borderRadius.sm }}>
            <div style={{ marginBottom: theme.spacing.sm, color: theme.colors.textPrimary, fontWeight: 600 }}>
              Crossfade
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, color: theme.colors.textSecondary, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={crossfadeEnabled}
                  onChange={(e) => setCrossfadeEnabled(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>Activer le crossfade</span>
              </label>
              {crossfadeEnabled && (
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                  <span style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm }}>
                    Durée: {crossfadeDuration}s
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={crossfadeDuration}
                    onChange={(e) => setCrossfadeDuration(parseFloat(e.target.value))}
                    style={{ width: '100px', cursor: 'pointer' }}
                  />
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Liste d'attente */}
      {showQueueModal && (
        <Modal
          isOpen={showQueueModal}
          onClose={() => setShowQueueModal(false)}
          title={`Liste d'attente (${queue.length})`}
          size="md"
        >
          {queue.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: theme.spacing['2xl'],
              color: theme.colors.textSecondary 
            }}>
              <div style={{ fontSize: '3rem', marginBottom: theme.spacing.md }}>📋</div>
              <p>La liste d'attente est vide</p>
              <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textTertiary, marginTop: theme.spacing.sm }}>
                Ajoutez des médias à la liste d'attente pour les voir apparaître ici
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {queue.map((media, index) => (
                <div
                  key={media.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    padding: theme.spacing.md,
                    marginBottom: theme.spacing.xs,
                    backgroundColor: theme.colors.bgSecondary,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.borderPrimary}`,
                    cursor: 'pointer',
                    transition: theme.transitions.base,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.bgTertiary
                    e.currentTarget.style.borderColor = theme.colors.primary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.bgSecondary
                    e.currentTarget.style.borderColor = theme.colors.borderPrimary
                  }}
                >
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: theme.colors.bgTertiary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: theme.fontSizes.xl,
                    flexShrink: 0,
                  }}>
                    {media.thumbnail_url ? (
                      <img
                        src={media.thumbnail_url}
                        alt={media.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: theme.borderRadius.sm,
                        }}
                      />
                    ) : (
                      media.type === 'music' ? '🎵' : '🎬'
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: theme.fontSizes.base,
                      fontWeight: 600,
                      color: theme.colors.textPrimary,
                      marginBottom: theme.spacing.xs / 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {media.title}
                    </div>
                    {media.artist && (
                      <div style={{
                        fontSize: theme.fontSizes.sm,
                        color: theme.colors.textSecondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {media.artist}
                      </div>
                    )}
                    {media.duration && (
                      <div style={{
                        fontSize: theme.fontSizes.xs,
                        color: theme.colors.textTertiary,
                        marginTop: theme.spacing.xs / 2,
                      }}>
                        {formatTime(media.duration)}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: theme.spacing.xs, alignItems: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        play(media)
                        // Retirer le média de la queue s'il est joué
                        removeFromQueue(media.id)
                      }}
                      style={{
                        backgroundColor: theme.colors.primary,
                        border: 'none',
                        color: theme.colors.textInverse,
                        width: '32px',
                        height: '32px',
                        borderRadius: theme.borderRadius.md,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: theme.fontSizes.base,
                        transition: theme.transitions.base,
                      }}
                      title="Jouer maintenant"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)'
                        e.currentTarget.style.boxShadow = theme.shadows.glow
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      ▶
                    </button>
                    {isAuthenticated && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedMediaId(media.id)
                          setShowAddToPlaylistModal(true)
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          border: `1px solid ${theme.colors.borderPrimary}`,
                          color: theme.colors.textPrimary,
                          width: '32px',
                          height: '32px',
                          borderRadius: theme.borderRadius.md,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: theme.fontSizes.base,
                          transition: theme.transitions.base,
                        }}
                        title="Ajouter à une playlist"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.colors.primary
                          e.currentTarget.style.borderColor = theme.colors.primary
                          e.currentTarget.style.color = theme.colors.textInverse
                          e.currentTarget.style.boxShadow = theme.shadows.glow
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent'
                          e.currentTarget.style.borderColor = theme.colors.borderPrimary
                          e.currentTarget.style.color = theme.colors.textPrimary
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        📋
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFromQueue(media.id)
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        border: `1px solid ${theme.colors.borderPrimary}`,
                        color: theme.colors.textSecondary,
                        width: '32px',
                        height: '32px',
                        borderRadius: theme.borderRadius.md,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: theme.fontSizes.base,
                        transition: theme.transitions.base,
                      }}
                      title="Retirer de la liste"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.colors.error
                        e.currentTarget.style.borderColor = theme.colors.error
                        e.currentTarget.style.color = theme.colors.textInverse
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.borderColor = theme.colors.borderPrimary
                        e.currentTarget.style.color = theme.colors.textSecondary
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {queue.length > 0 && (
                <div style={{ 
                  marginTop: theme.spacing.md, 
                  paddingTop: theme.spacing.md,
                  borderTop: `1px solid ${theme.colors.borderPrimary}`,
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Voulez-vous vraiment vider la liste d\'attente ?')) {
                        clearQueue()
                      }
                    }}
                    style={{
                      color: theme.colors.error,
                      borderColor: theme.colors.error,
                    }}
                  >
                    Vider la liste
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* Modal Ajouter à une playlist */}
      {showAddToPlaylistModal && selectedMediaId && (
        <AddToPlaylistModal
          mediaId={selectedMediaId}
          onClose={() => {
            setShowAddToPlaylistModal(false)
            setSelectedMediaId(null)
          }}
          onSuccess={() => {
            // Optionnel : afficher un message de succès
          }}
        />
      )}
    </CarModeOverlay>
  )
}

export default PlayerBarFull

