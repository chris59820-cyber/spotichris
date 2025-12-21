import React, { useEffect, useRef } from 'react'
import { usePlayer } from '../../contexts/PlayerContext'
import { theme } from '../../styles/theme'

interface AudioPlayerProps {
  track: {
    id: number
    title: string
    artist?: string
    album?: string
    url: string
    duration?: number
  }
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ track }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
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
  } = usePlayer()

  // Sync audio element with context
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Update audio source when track changes
    let shouldAutoPlay = false
    if (currentlyPlaying?.media.id === track.id && track.url) {
      if (audio.src !== track.url) {
        audio.src = track.url
        audio.load()
        // Marquer qu'on doit lancer la lecture automatiquement quand le média sera prêt
        shouldAutoPlay = isPlaying
      }
    }

    // Sync play/pause state
    if (isPlaying && currentlyPlaying?.media.id === track.id) {
      // S'assurer que la lecture démarre même si le média vient d'être changé
      if (audio.paused) {
        // Si le média est déjà chargé, lancer immédiatement
        if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
          audio.play().catch((error) => {
            console.error('Error playing audio:', error)
            updateIsPlaying(false)
          })
        } else {
          // Sinon, attendre que le média soit prêt
          const handleCanPlay = () => {
            audio.play().catch((error) => {
              console.error('Error playing audio:', error)
              updateIsPlaying(false)
            })
            audio.removeEventListener('canplay', handleCanPlay)
          }
          audio.addEventListener('canplay', handleCanPlay)
        }
      }
    } else {
      audio.pause()
    }

    // Gérer le démarrage automatique pour un nouveau média
    if (shouldAutoPlay) {
      const handleCanPlayAuto = () => {
        audio.play().catch((error) => {
          console.error('Error playing audio:', error)
          updateIsPlaying(false)
        })
        audio.removeEventListener('canplay', handleCanPlayAuto)
      }
      audio.addEventListener('canplay', handleCanPlayAuto)
    }

    // Sync volume
    audio.volume = volume

    // Sync seek
    if (Math.abs(audio.currentTime - currentTime) > 1) {
      audio.currentTime = currentTime
    }

    // Event listeners
    const handleTimeUpdate = () => {
      updateTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      updateDuration(audio.duration || 0)
    }

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
  }, [
    track.id,
    track.url,
    currentlyPlaying?.media.id,
    isPlaying,
    currentTime,
    volume,
    updateTime,
    updateDuration,
    updateIsPlaying,
  ])

  const handleSeek = (time: number) => {
    seek(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const playerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
  }

  const controlsRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
  }

  const infoStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  }

  const titleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes.base,
    fontWeight: 600,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
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

  const buttonStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: theme.borderRadius.full,
    border: 'none',
    backgroundColor: theme.colors.primary,
    color: theme.colors.textInverse,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.fontSizes.lg,
    transition: theme.transitions.base,
  }

  const progressBarStyle: React.CSSProperties = {
    flex: 1,
    height: '6px',
    backgroundColor: theme.colors.bgTertiary,
    borderRadius: theme.borderRadius.full,
    position: 'relative',
    cursor: 'pointer',
  }

  const progressFillStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
    transition: 'width 0.1s linear',
  }

  const timeStyle: React.CSSProperties = {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
    minWidth: '80px',
    textAlign: 'right',
  }

  const volumeControlStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    minWidth: '150px',
  }

  const volumeSliderStyle: React.CSSProperties = {
    flex: 1,
    height: '4px',
    backgroundColor: theme.colors.bgTertiary,
    borderRadius: theme.borderRadius.full,
    position: 'relative',
    cursor: 'pointer',
  }

  const volumeFillStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    width: `${volume * 100}%`,
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    handleSeek(percent * duration)
  }

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    handleVolumeChange(percent)
  }

  return (
    <>
      <audio ref={audioRef} preload="metadata" />
      <div style={playerStyle}>
        {/* Track Info */}
        <div style={infoStyle}>
          <div style={titleStyle}>{track.title}</div>
          {track.artist && <div style={artistStyle}>{track.artist}</div>}
        </div>

        {/* Main Controls */}
        <div style={controlsRowStyle}>
          <button
            style={buttonStyle}
            onClick={togglePlayPause}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = theme.shadows.glow
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div
            style={progressBarStyle}
            onClick={handleProgressClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.bgHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.bgTertiary
            }}
          >
            <div style={progressFillStyle} />
          </div>

          <div style={timeStyle}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Volume Control */}
        <div style={controlsRowStyle}>
          <div style={volumeControlStyle}>
            <span style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm }}>
              🔊
            </span>
            <div
              style={volumeSliderStyle}
              onClick={handleVolumeClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.bgHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.bgTertiary
              }}
            >
              <div style={volumeFillStyle} />
            </div>
            <span style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.xs }}>
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default AudioPlayer
