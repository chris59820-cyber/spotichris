import React, { useRef, useEffect, useState, useCallback } from 'react'
import { usePlayer } from '../../contexts/PlayerContext'
import { theme } from '../../styles/theme'
import { normalizeMediaUrl } from '../../utils/urlUtils'

interface VideoPlayerMiniProps {
  video: {
    id: number
    title: string
    description?: string
    url: string
    duration?: number
    thumbnail_url?: string
  }
  onCinemaMode?: () => void
  onResize?: () => void
  videoSize?: 'small' | 'medium' | 'large'
  isCinemaMode?: boolean
}

const VideoPlayerMini: React.FC<VideoPlayerMiniProps> = ({ 
  video, 
  onCinemaMode, 
  onResize,
  isCinemaMode = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showControls, setShowControls] = useState(true)
  const [isVideoHidden, setIsVideoHidden] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
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
    playNext,
    queue,
  } = usePlayer()

  // Fonction pour réinitialiser le timer de masquage des contrôles
  const resetHideControlsTimer = useCallback(() => {
    setShowControls(true)
    
    // Nettoyer le timer précédent s'il existe
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
    
    // Masquer les contrôles après 10 secondes si la vidéo est en lecture
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 10000)
    }
  }, [isPlaying])

  // Réinitialiser le timer quand l'utilisateur interagit
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleInteraction = () => {
      resetHideControlsTimer()
    }

    // Écouter les événements d'interaction
    container.addEventListener('click', handleInteraction)
    container.addEventListener('touchstart', handleInteraction)
    container.addEventListener('mousemove', handleInteraction)

    return () => {
      container.removeEventListener('click', handleInteraction)
      container.removeEventListener('touchstart', handleInteraction)
      container.removeEventListener('mousemove', handleInteraction)
    }
  }, [resetHideControlsTimer])

  // Réinitialiser le timer quand la vidéo change d'état
  useEffect(() => {
    resetHideControlsTimer()
    
    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current)
      }
    }
  }, [isPlaying, resetHideControlsTimer])

  // Sync video element with context
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    // Update video source when video changes
    if (currentlyPlaying?.media.id === video.id && video.url) {
      // Normaliser l'URL pour utiliser le proxy Vite
      const fullUrl = normalizeMediaUrl(video.url)
      console.log('VideoPlayerMini URL conversion:', video.url, '->', fullUrl)
      
      // Normaliser l'URL pour la comparaison
      const normalizeUrl = (url: string) => {
        try {
          if (url.startsWith('http://') || url.startsWith('https://')) {
            return new URL(url).pathname
          }
          return url
        } catch {
          return url
        }
      }
      
      const currentNormalizedUrl = normalizeUrl(fullUrl)
      const videoNormalizedUrl = videoElement.src ? normalizeUrl(videoElement.src) : ''
      
      if (videoNormalizedUrl !== currentNormalizedUrl) {
        console.log('Loading video in VideoPlayerMini:', fullUrl, 'isPlaying:', isPlaying)
        // Réinitialiser l'élément vidéo
        videoElement.pause()
        videoElement.src = ''
        videoElement.load()
        
        // Attendre un peu avant de charger la nouvelle source
        setTimeout(() => {
          videoElement.src = fullUrl
          videoElement.load()
          console.log('Video src set to:', fullUrl, 'readyState:', videoElement.readyState)
          
          // Si on doit jouer, attendre que le média soit prêt
          if (isPlaying) {
            const tryPlay = () => {
              console.log('Attempting to play video, readyState:', videoElement.readyState)
              if (videoElement.readyState >= 2) {
                videoElement.play().then(() => {
                  console.log('Video playing successfully in VideoPlayerMini')
                }).catch((error) => {
                  console.error('Error playing video:', error)
                  updateIsPlaying(false)
                })
              } else {
                // Attendre que le média soit prêt
                const handleCanPlay = () => {
                  console.log('Video can play, starting playback')
                  videoElement.play().then(() => {
                    console.log('Video playing successfully in VideoPlayerMini (after canplay)')
                  }).catch((error) => {
                    console.error('Error playing video:', error)
                    updateIsPlaying(false)
                  })
                  videoElement.removeEventListener('canplay', handleCanPlay)
                  videoElement.removeEventListener('loadeddata', handleCanPlay)
                }
                videoElement.addEventListener('canplay', handleCanPlay)
                videoElement.addEventListener('loadeddata', handleCanPlay)
              }
            }
            
            // Essayer de jouer immédiatement ou attendre
            if (videoElement.readyState >= 2) {
              tryPlay()
            } else {
              const handleReady = () => {
                tryPlay()
                videoElement.removeEventListener('canplay', handleReady)
                videoElement.removeEventListener('loadeddata', handleReady)
              }
              videoElement.addEventListener('canplay', handleReady)
              videoElement.addEventListener('loadeddata', handleReady)
            }
          }
        }, 100)
      }
    }

    // Sync play/pause state
    if (isPlaying && currentlyPlaying?.media.id === video.id) {
      // S'assurer que la lecture démarre même si le média vient d'être changé
      if (videoElement.paused && videoElement.src) {
        console.log('Video should be playing, attempting to play, readyState:', videoElement.readyState)
        // Si le média est déjà chargé, lancer immédiatement
        if (videoElement.readyState >= 2) {
          videoElement.play().then(() => {
            console.log('Video playing successfully (sync state)')
          }).catch((error) => {
            console.error('Error playing video:', error)
            updateIsPlaying(false)
          })
        } else {
          // Sinon, attendre que le média soit prêt
          const handleCanPlay = () => {
            console.log('Video can play (sync state), starting playback')
            videoElement.play().then(() => {
              console.log('Video playing successfully (sync state, after canplay)')
            }).catch((error) => {
              console.error('Error playing video:', error)
              updateIsPlaying(false)
            })
            videoElement.removeEventListener('canplay', handleCanPlay)
            videoElement.removeEventListener('loadeddata', handleCanPlay)
          }
          videoElement.addEventListener('canplay', handleCanPlay)
          videoElement.addEventListener('loadeddata', handleCanPlay)
        }
      }
    } else if (!isPlaying && currentlyPlaying?.media.id === video.id) {
      videoElement.pause()
    }

    // Sync volume - s'assurer que le volume n'est pas à 0
    const finalVolume = volume > 0 ? volume : 0.5
    if (videoElement.volume !== finalVolume) {
      console.log('Setting video volume to:', finalVolume)
      videoElement.volume = finalVolume
      if (volume === 0) {
        setVolume(0.5)
      }
    }
    
    // S'assurer que la vidéo n'est pas muette
    if (videoElement.muted) {
      console.warn('Video is muted, unmuting')
      videoElement.muted = false
    }

    // Sync seek
    if (Math.abs(videoElement.currentTime - currentTime) > 1) {
      videoElement.currentTime = currentTime
    }

    // Event listeners
    const handleTimeUpdate = () => {
      updateTime(videoElement.currentTime)
    }

    const handleLoadedMetadata = () => {
      updateDuration(videoElement.duration || 0)
    }

    const handleEnded = () => {
      updateIsPlaying(false)
      updateTime(0)
      
      // Jouer le prochain média de la queue si disponible
      if (queue.length > 0) {
        playNext()
      }
    }

    const handlePlay = () => updateIsPlaying(true)
    const handlePause = () => updateIsPlaying(false)
    const handleError = (e: Event) => {
      console.error('Video element error in useEffect:', e, videoElement.error)
      if (videoElement.error) {
        const errorCode = videoElement.error.code
        const errorMessage = videoElement.error.message
        const fileExtension = video.url?.split('.').pop()?.toLowerCase()
        
        // Détecter les erreurs de format non supporté
        if (errorCode === 4 || errorMessage?.includes('DEMUXER_ERROR') || errorMessage?.includes('Could not open')) {
          if (fileExtension === 'avi' || fileExtension === 'mkv' || fileExtension === 'flv') {
            alert(`❌ Format vidéo non supporté\n\nLe format ${fileExtension.toUpperCase()} n'est pas supporté par les navigateurs web.\n\nFormats supportés : MP4 (H.264), WebM, OGG\n\nVeuillez convertir votre fichier en MP4 pour pouvoir le lire dans le navigateur.`)
          } else {
            alert(`❌ Erreur de lecture vidéo\n\nLe navigateur ne peut pas lire ce fichier vidéo.\n\nCode d'erreur : ${errorCode}\nMessage : ${errorMessage}\n\nVeuillez vérifier que le fichier n'est pas corrompu et qu'il est dans un format supporté (MP4, WebM, OGG).`)
          }
        }
      }
      updateIsPlaying(false)
    }

    videoElement.addEventListener('timeupdate', handleTimeUpdate)
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata)
    videoElement.addEventListener('ended', handleEnded)
    videoElement.addEventListener('play', handlePlay)
    videoElement.addEventListener('pause', handlePause)
    videoElement.addEventListener('error', handleError)

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate)
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
      videoElement.removeEventListener('ended', handleEnded)
      videoElement.removeEventListener('play', handlePlay)
      videoElement.removeEventListener('pause', handlePause)
      videoElement.removeEventListener('error', handleError)
    }
  }, [
    video.id,
    video.url,
    currentlyPlaying?.media.id,
    isPlaying,
    currentTime,
    volume,
    updateTime,
    updateDuration,
    updateIsPlaying,
    queue,
    playNext,
  ])

  const handleSeek = (time: number) => {
    seek(time)
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
    }
  }

  const handleFastForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.duration,
        videoRef.current.currentTime + 10
      )
    }
  }

  const handleFullscreen = () => {
    if (!videoRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoRef.current.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable fullscreen:', err)
      })
    }
    resetHideControlsTimer()
  }

  const handleToggleVideoVisibility = () => {
    setIsVideoHidden((prev) => !prev)
    resetHideControlsTimer()
  }

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    flex: 1,
    backgroundColor: theme.colors.bgPrimary,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }

  const videoStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    display: isVideoHidden ? 'none' : 'block',
    backgroundColor: theme.colors.bgPrimary,
    flex: 1,
  }

  const hiddenVideoOverlayStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.bgPrimary,
    display: isVideoHidden ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'relative',
  }

  const controlsStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: theme.spacing.sm,
    display: showControls ? 'flex' : 'none',
    flexDirection: 'column',
    gap: theme.spacing.xs,
    transition: 'opacity 0.3s ease, visibility 0.3s ease',
    opacity: showControls ? 1 : 0,
    visibility: showControls ? 'visible' : 'hidden',
  }

  const progressBarContainerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '50px', // Au-dessus des contrôles (ajusté selon la hauteur des contrôles)
    left: 0,
    right: 0,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 10,
    display: showControls ? 'block' : 'none',
    opacity: showControls ? 1 : 0,
    visibility: showControls ? 'visible' : 'hidden',
    transition: 'opacity 0.3s ease, visibility 0.3s ease',
  }

  const controlsRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.xs,
    width: '100%',
  }

  const buttonStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    borderRadius: theme.borderRadius.md,
    border: 'none',
    backgroundColor: theme.colors.primary,
    color: theme.colors.textInverse,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.fontSizes.base,
    transition: theme.transitions.base,
  }

  const progressBarStyle: React.CSSProperties = {
    flex: 1,
    height: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: theme.borderRadius.full,
    position: 'relative',
    cursor: 'pointer',
    transition: 'height 0.2s ease, background-color 0.2s ease',
    boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.3)',
  }

  const progressFillStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
    transition: 'width 0.1s linear',
    position: 'relative',
    boxShadow: `0 0 8px ${theme.colors.primary}80`,
  }

  const progressHandleStyle: React.CSSProperties = {
    position: 'absolute',
    right: '-12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: theme.colors.primary,
    border: `4px solid ${theme.colors.textPrimary}`,
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: 1, // Toujours visible maintenant
    transition: 'transform 0.1s ease, box-shadow 0.2s ease',
    boxShadow: `0 0 16px ${theme.colors.primary}CC, 0 3px 6px rgba(0, 0, 0, 0.3)`,
    zIndex: 15,
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const progressIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${progressPercent}%`,
    top: '-16px',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '14px solid transparent',
    borderRight: '14px solid transparent',
    borderBottom: `16px solid ${theme.colors.primary}`,
    opacity: 1,
    transition: 'left 0.1s linear',
    pointerEvents: 'none',
    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
  }

  const timeStyle: React.CSSProperties = {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textPrimary,
    minWidth: '60px',
    textAlign: 'right',
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || isDragging) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    handleSeek(percent * duration)
  }

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    // Ne pas déclencher si on clique directement sur la poignée
    if ((e.target as HTMLElement).closest('[data-progress-handle]')) {
      return
    }
    e.preventDefault()
    setIsDragging(true)
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    handleSeek(percent * duration)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault()
      const progressBar = e.currentTarget
      const newRect = progressBar.getBoundingClientRect()
      const newPercent = Math.max(0, Math.min(1, (moveEvent.clientX - newRect.left) / newRect.width))
      handleSeek(newPercent * duration)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseUp)
      resetHideControlsTimer()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseUp)
  }

  const handleHandleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)

    const progressBar = e.currentTarget.closest('[data-progress-bar]') as HTMLElement
    if (!progressBar) return

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault()
      const rect = progressBar.getBoundingClientRect()
      const newPercent = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width))
      handleSeek(newPercent * duration)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mouseleave', handleMouseUp)
      resetHideControlsTimer()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mouseleave', handleMouseUp)
  }

  return (
    <div 
      ref={containerRef}
      style={containerStyle}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        // Masquer après un délai si la vidéo est en lecture
        if (isPlaying) {
          if (hideControlsTimeoutRef.current) {
            clearTimeout(hideControlsTimeoutRef.current)
          }
          hideControlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false)
          }, 2000) // Délai plus court au survol
        }
      }}
    >
      <video
        ref={videoRef}
        src={video.url ? normalizeMediaUrl(video.url) : undefined}
        poster={video.thumbnail_url}
        style={videoStyle}
        onClick={(e) => {
          e.stopPropagation()
          togglePlayPause()
          resetHideControlsTimer()
        }}
        playsInline
        muted={false}
        crossOrigin="anonymous"
        onError={(e) => {
          console.error('Video element error event:', e, videoRef.current?.error)
          if (videoRef.current?.error) {
            const errorCode = videoRef.current.error.code
            const errorMessage = videoRef.current.error.message
            const fileExtension = video.url?.split('.').pop()?.toLowerCase()
            
            // Détecter les erreurs de format non supporté
            if (errorCode === 4 || errorMessage?.includes('DEMUXER_ERROR') || errorMessage?.includes('Could not open')) {
              if (fileExtension === 'avi' || fileExtension === 'mkv' || fileExtension === 'flv') {
                alert(`❌ Format vidéo non supporté\n\nLe format ${fileExtension.toUpperCase()} n'est pas supporté par les navigateurs web.\n\nFormats supportés : MP4 (H.264), WebM, OGG\n\nVeuillez convertir votre fichier en MP4 pour pouvoir le lire dans le navigateur.`)
              } else {
                alert(`❌ Erreur de lecture vidéo\n\nLe navigateur ne peut pas lire ce fichier vidéo.\n\nCode d'erreur : ${errorCode}\nMessage : ${errorMessage}\n\nVeuillez vérifier que le fichier n'est pas corrompu et qu'il est dans un format supporté (MP4, WebM, OGG).`)
              }
            }
            updateIsPlaying(false)
          }
        }}
      />
      {/* Overlay quand la vidéo est masquée */}
      {isVideoHidden && (
        <div style={hiddenVideoOverlayStyle}>
          <div
            style={{
              textAlign: 'center',
              color: theme.colors.textSecondary,
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: theme.spacing.md }}>🎵</div>
            <div style={{ fontSize: theme.fontSizes.base, fontWeight: 600 }}>
              {video.title}
            </div>
            <div style={{ fontSize: theme.fontSizes.sm, marginTop: theme.spacing.xs }}>
              Lecture audio uniquement
            </div>
          </div>
        </div>
      )}
      {/* Progress Bar - En bas */}
      <div style={progressBarContainerStyle}>
        <div
          data-progress-bar
          style={progressBarStyle}
          onClick={handleProgressClick}
          onMouseDown={handleProgressMouseDown}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)'
            e.currentTarget.style.height = '28px'
            const handle = e.currentTarget.querySelector('[data-progress-handle]') as HTMLElement
            if (handle && !isDragging) {
              handle.style.transform = 'translateY(-50%) scale(1.3)'
              handle.style.boxShadow = `0 0 20px ${theme.colors.primary}FF, 0 4px 8px rgba(0, 0, 0, 0.4)`
            }
            resetHideControlsTimer()
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'
              e.currentTarget.style.height = '20px'
              const handle = e.currentTarget.querySelector('[data-progress-handle]') as HTMLElement
              if (handle) {
                handle.style.transform = 'translateY(-50%) scale(1)'
                handle.style.boxShadow = `0 0 16px ${theme.colors.primary}CC, 0 3px 6px rgba(0, 0, 0, 0.3)`
              }
            }
          }}
        >
          <div style={progressFillStyle}>
            <div
              style={progressHandleStyle}
              data-progress-handle
              onMouseDown={handleHandleMouseDown}
              onMouseEnter={(e) => {
                if (!isDragging) {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1.3)'
                  e.currentTarget.style.boxShadow = `0 0 20px ${theme.colors.primary}FF, 0 4px 8px rgba(0, 0, 0, 0.4)`
                }
              }}
              onMouseLeave={(e) => {
                if (!isDragging) {
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)'
                  e.currentTarget.style.boxShadow = `0 0 16px ${theme.colors.primary}CC, 0 3px 6px rgba(0, 0, 0, 0.3)`
                }
              }}
            />
          </div>
          <div style={progressIndicatorStyle} />
        </div>
      </div>

      <div style={controlsStyle}>

        {/* Controls Row */}
        <div style={controlsRowStyle}>
          {/* Left side controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
          <button
            style={buttonStyle}
            onClick={(e) => {
              e.stopPropagation()
              handleRewind()
              resetHideControlsTimer()
            }}
            title="Reculer de 10 secondes"
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = theme.shadows.glow
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            ⏮
          </button>
          <button
            style={buttonStyle}
            onClick={(e) => {
              e.stopPropagation()
              togglePlayPause()
              resetHideControlsTimer()
            }}
            title={isPlaying ? 'Pause' : 'Lecture'}
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
          <button
            style={buttonStyle}
            onClick={(e) => {
              e.stopPropagation()
              handleFastForward()
              resetHideControlsTimer()
            }}
            title="Avancer de 10 secondes"
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = theme.shadows.glow
              e.currentTarget.style.transform = 'scale(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            ⏭
          </button>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.xs,
                marginLeft: theme.spacing.xs,
              }}
            >
              <span style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.xs }}>
                🔊
              </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => {
                handleVolumeChange(parseFloat(e.target.value))
                resetHideControlsTimer()
              }}
              onClick={(e) => {
                e.stopPropagation()
                resetHideControlsTimer()
              }}
              style={{
                width: '60px',
              }}
            />
            </div>
          </div>

          {/* Center - Time display */}
          <div style={timeStyle}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Right side controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
            <button
              style={buttonStyle}
              onClick={(e) => {
                e.stopPropagation()
                handleToggleVideoVisibility()
              }}
              title={isVideoHidden ? 'Afficher la vidéo' : 'Masquer la vidéo'}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = theme.shadows.glow
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              {isVideoHidden ? '👁️' : '👁️‍🗨️'}
            </button>
            <button
              style={buttonStyle}
              onClick={(e) => {
                e.stopPropagation()
                resetHideControlsTimer()
              }}
              title="Paramètres"
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = theme.shadows.glow
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              ⚙️
            </button>
            {onResize && (
              <button
                style={buttonStyle}
                onClick={(e) => {
                  e.stopPropagation()
                  onResize()
                  resetHideControlsTimer()
                }}
                title="Redimensionner"
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = theme.shadows.glow
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                ⇄
              </button>
            )}
            {onCinemaMode && (
              <button
                style={buttonStyle}
                onClick={(e) => {
                  e.stopPropagation()
                  onCinemaMode()
                  resetHideControlsTimer()
                }}
                title={isCinemaMode ? 'Quitter le mode cinéma' : 'Mode cinéma'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = theme.shadows.glow
                  e.currentTarget.style.transform = 'scale(1.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                🎬
              </button>
            )}
            <button
              style={buttonStyle}
              onClick={(e) => {
                e.stopPropagation()
                resetHideControlsTimer()
              }}
              title="Diffuser"
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = theme.shadows.glow
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              📺
            </button>
            <button
              style={buttonStyle}
              onClick={(e) => {
                e.stopPropagation()
                handleFullscreen()
                resetHideControlsTimer()
              }}
              title="Plein écran"
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = theme.shadows.glow
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              ⛶
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayerMini

