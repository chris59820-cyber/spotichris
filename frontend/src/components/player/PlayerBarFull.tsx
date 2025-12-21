import React, { useState, useRef, useEffect } from 'react'
import { usePlayer } from '../../contexts/PlayerContext'
import { useAuth } from '../../features/auth/AuthContext'
import { favoritesService } from '../../services/favorites.service'
import { theme } from '../../styles/theme'
import { useCrossfade } from '../../hooks/useCrossfade'
import { useEqualizer } from '../../hooks/useEqualizer'
import { useCarMode } from '../../hooks/useCarMode'
import { useSmartSpeakers } from '../../hooks/useSmartSpeakers'
import Equalizer from '../audio/Equalizer'
import CarModeOverlay from '../audio/CarModeOverlay'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

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
  useEffect(() => {
    if (audioRef.current && audioContextRef.current && currentlyPlaying?.type === 'audio') {
      // Vérifier si l'égaliseur n'a pas déjà été initialisé pour cet élément
      const isInitialized = audioRef.current.getAttribute('data-equalizer-initialized') === 'true'
      if (!isInitialized) {
        try {
          equalizer.initialize(audioRef.current)
        } catch (error) {
          // Ignorer les erreurs de double connexion
          console.warn('Equalizer initialization warning:', error)
        }
      }
    }
  }, [currentlyPlaying?.media.id, equalizer])

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

    const currentNormalizedUrl = normalizeUrl(currentUrl)
    const audioNormalizedUrl = audio.src ? normalizeUrl(audio.src) : ''
    
    // Vérifier si l'URL a changé
    if (audioNormalizedUrl !== currentNormalizedUrl) {
      // Nouveau média, charger
      audio.src = currentUrl
      audio.load()
    }

    // Gérer la lecture
    if (isPlaying) {
      const playAudio = () => {
        audio.play().catch((error) => {
          console.error('Error playing audio:', error)
          updateIsPlaying(false)
        })
      }

      // Si le média est déjà chargé, jouer immédiatement
      if (audio.readyState >= 2) {
        playAudio()
      } else {
        // Attendre que le média soit prêt
        const handleCanPlay = () => {
          playAudio()
          audio.removeEventListener('canplay', handleCanPlay)
          audio.removeEventListener('loadeddata', handleCanPlay)
        }
        audio.addEventListener('canplay', handleCanPlay)
        audio.addEventListener('loadeddata', handleCanPlay)
      }
    } else {
      audio.pause()
    }

    audio.volume = volume

    const handleTimeUpdate = () => updateTime(audio.currentTime)
    const handleLoadedMetadata = () => updateDuration(audio.duration || 0)
    const handleEnded = () => {
      updateIsPlaying(false)
      updateTime(0)
    }
    const handlePlay = () => updateIsPlaying(true)
    const handlePause = () => updateIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [currentlyPlaying, isPlaying, volume, updateTime, updateDuration, updateIsPlaying])

  // Gérer la lecture vidéo
  useEffect(() => {
    const video = videoRef.current
    if (!video || !currentlyPlaying || currentlyPlaying.type !== 'video') return

    const currentUrl = currentlyPlaying.media.url
    if (!currentUrl) {
      console.warn('No URL for video media:', currentlyPlaying.media)
      return
    }

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

    const currentNormalizedUrl = normalizeUrl(currentUrl)
    const videoNormalizedUrl = video.src ? normalizeUrl(video.src) : ''
    
    // Vérifier si l'URL a changé
    if (videoNormalizedUrl !== currentNormalizedUrl) {
      // Nouveau média, charger
      video.src = currentUrl
      video.load()
    }

    // Gérer la lecture
    if (isPlaying) {
      const playVideo = () => {
        video.play().catch((error) => {
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

    video.volume = volume

    const handleTimeUpdate = () => updateTime(video.currentTime)
    const handleLoadedMetadata = () => updateDuration(video.duration || 0)
    const handleEnded = () => {
      updateIsPlaying(false)
      updateTime(0)
    }
    const handlePlay = () => updateIsPlaying(true)
    const handlePause = () => updateIsPlaying(false)
    const handleError = (e: Event) => {
      console.error('Video error:', e)
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
  }, [currentlyPlaying, isPlaying, volume, updateTime, updateDuration, updateIsPlaying])

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
      {currentlyPlaying.type === 'audio' && <audio ref={audioRef} preload="metadata" />}
      {currentlyPlaying.type === 'video' && <video ref={videoRef} preload="metadata" style={{ display: 'none' }} />}
      
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
            style={controlButtonStyle}
            title="File d'attente"
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
    </CarModeOverlay>
  )
}

export default PlayerBarFull

