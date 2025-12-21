import React, { useState } from 'react'
import { usePlayer } from '../../contexts/PlayerContext'
import AudioPlayer from '../player/AudioPlayer'
import VideoPlayerMini from '../player/VideoPlayerMini'
import PlayerBarFull from '../player/PlayerBarFull'
import { theme } from '../../styles/theme'
import Button from '../ui/Button'

const PlayerBar: React.FC = () => {
  const { currentlyPlaying, volume, setVolume } = usePlayer()
  const [isVideoMinimized, setIsVideoMinimized] = useState(false)
  const [videoSize, setVideoSize] = useState<'small' | 'medium' | 'large'>('large')
  const [videoHeight, setVideoHeight] = useState<number>(500) // Hauteur personnalisée en pixels (augmentée)
  const [isCinemaMode, setIsCinemaMode] = useState(false)

  const playerBarStyle: React.CSSProperties = {
    height: currentlyPlaying ? (currentlyPlaying.type === 'video' && !isVideoMinimized ? 'auto' : '120px') : '80px',
    backgroundColor: theme.colors.bgSecondary,
    borderTop: `1px solid ${theme.colors.borderPrimary}`,
    padding: currentlyPlaying ? theme.spacing.md : `0 ${theme.spacing.xl}`,
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndex.fixed,
    transition: theme.transitions.base,
  }

  const getVideoWidth = () => {
    if (isVideoMinimized) return '200px'
    if (isCinemaMode) return '100vw'
    switch (videoSize) {
      case 'small':
        return '400px'
      case 'medium':
        return '600px'
      case 'large':
        return '800px'
      default:
        return '800px'
    }
  }

  const videoPlayerContainerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    right: 0, // Changé de left: 0 à right: 0 pour positionner à droite
    left: 'auto', // S'assurer que left n'est pas défini
    width: currentlyPlaying?.type === 'video' && !isVideoMinimized ? getVideoWidth() : '320px',
    height: isCinemaMode ? '100vh' : isVideoMinimized ? 'auto' : `${videoHeight}px`,
    maxHeight: isCinemaMode ? '100vh' : '90vh',
    backgroundColor: theme.colors.bgSecondary,
    borderTop: `1px solid ${theme.colors.borderPrimary}`,
    borderLeft: isCinemaMode ? 'none' : `1px solid ${theme.colors.borderPrimary}`, // Changé de borderRight à borderLeft
    borderRight: 'none', // Pas de bordure à droite maintenant
    zIndex: isCinemaMode ? theme.zIndex.modal : theme.zIndex.fixed + 1,
    transition: theme.transitions.base,
    boxShadow: theme.shadows.lg,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  const placeholderStyle: React.CSSProperties = {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSizes.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  }

  if (!currentlyPlaying || !currentlyPlaying.media) {
    return (
      <div style={playerBarStyle}>
        <div style={placeholderStyle}>Aucune lecture en cours</div>
      </div>
    )
  }

  // Video player - positioned bottom left
  if (currentlyPlaying.type === 'video') {
    return (
      <>
        {/* Cinema mode overlay */}
        {isCinemaMode && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              zIndex: theme.zIndex.modal - 1,
              pointerEvents: 'none',
            }}
          />
        )}
        <div style={videoPlayerContainerStyle}>
          <div style={{ position: 'relative', width: '100%', height: '100%', flex: 1, overflow: 'hidden' }}>
            {/* Resize handle - horizontal (left side maintenant que le lecteur est à droite) */}
            {!isVideoMinimized && !isCinemaMode && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0, // Changé de right: 0 à left: 0
                  width: '20px',
                  height: '100%',
                  cursor: 'ew-resize',
                  zIndex: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  transition: theme.transitions.base,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.bgTertiary + '40'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  const startX = e.clientX
                  const startWidth = parseInt(getVideoWidth(), 10)
                  
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const diff = startX - moveEvent.clientX // Inversé car on redimensionne depuis la gauche
                    const newWidth = Math.max(400, Math.min(1200, startWidth + diff))
                    // Convert to size category
                    if (newWidth <= 500) {
                      setVideoSize('small')
                    } else if (newWidth <= 700) {
                      setVideoSize('medium')
                    } else {
                      setVideoSize('large')
                    }
                  }
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }
                  
                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
                title="Redimensionner la largeur"
              >
                <div
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: theme.fontSizes.sm,
                    pointerEvents: 'none',
                  }}
                >
                  ⇄
                </div>
              </div>
            )}

            {/* Resize handle - vertical (top side) */}
            {!isVideoMinimized && !isCinemaMode && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '20px', // Leave space for horizontal resize handle (maintenant à gauche)
                  right: 0,
                  height: '20px',
                  cursor: 'ns-resize',
                  zIndex: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'transparent',
                  transition: theme.transitions.base,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.bgTertiary + '40'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  const startY = e.clientY
                  const startHeight = videoHeight

                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const diff = startY - moveEvent.clientY // Inverted because we're dragging up
                    const newHeight = Math.max(300, Math.min(window.innerHeight - 100, startHeight + diff))
                    setVideoHeight(newHeight)
                  }

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }

                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
                title="Redimensionner la hauteur"
              >
                <div
                  style={{
                    color: theme.colors.textSecondary,
                    fontSize: theme.fontSizes.sm,
                    pointerEvents: 'none',
                  }}
                >
                  ⇅
                </div>
              </div>
            )}

            {/* Resize handle - corner (top-left maintenant que le lecteur est à droite) for diagonal resize */}
            {!isVideoMinimized && !isCinemaMode && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0, // Changé de right: 0 à left: 0
                  width: '20px',
                  height: '20px',
                  cursor: 'nesw-resize', // Changé de nwse-resize à nesw-resize pour le coin gauche
                  zIndex: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colors.bgTertiary + '60',
                  transition: theme.transitions.base,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.bgTertiary + '80'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.bgTertiary + '60'
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  const startX = e.clientX
                  const startY = e.clientY
                  const startWidth = parseInt(getVideoWidth(), 10)
                  const startHeight = videoHeight

                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const diffX = startX - moveEvent.clientX // Inversé car on redimensionne depuis la gauche
                    const diffY = startY - moveEvent.clientY // Inverted for height

                    // Update width
                    const newWidth = Math.max(400, Math.min(1200, startWidth + diffX))
                    if (newWidth <= 500) {
                      setVideoSize('small')
                    } else if (newWidth <= 700) {
                      setVideoSize('medium')
                    } else {
                      setVideoSize('large')
                    }

                    // Update height
                    const newHeight = Math.max(300, Math.min(window.innerHeight - 100, startHeight + diffY))
                    setVideoHeight(newHeight)
                  }

                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }

                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}
                title="Redimensionner (largeur et hauteur)"
              >
                <div
                  style={{
                    color: theme.colors.textPrimary,
                    fontSize: theme.fontSizes.xs,
                    pointerEvents: 'none',
                  }}
                >
                  ⤢
                </div>
              </div>
            )}
            
            <div
              style={{
                position: 'absolute',
                top: theme.spacing.xs,
                left: isVideoMinimized || isCinemaMode ? theme.spacing.xs : '30px', // Changé de right à left
                right: 'auto',
                zIndex: 10,
                display: 'flex',
                gap: theme.spacing.xs,
              }}
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsVideoMinimized(!isVideoMinimized)}
                style={{
                  minWidth: 'auto',
                  padding: theme.spacing.xs,
                  backgroundColor: theme.colors.bgTertiary + 'CC',
                  border: `1px solid ${theme.colors.borderPrimary}`,
                }}
                title={isVideoMinimized ? 'Agrandir' : 'Minimiser'}
              >
                {isVideoMinimized ? '⬆️' : '⬇️'}
              </Button>
            </div>
            <div 
              style={{ 
                flex: 1, 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column',
                visibility: isVideoMinimized ? 'hidden' : 'visible',
                position: isVideoMinimized ? 'absolute' : 'relative',
                width: isVideoMinimized ? '1px' : '100%',
                height: isVideoMinimized ? '1px' : 'auto',
                opacity: isVideoMinimized ? 0 : 1,
                pointerEvents: isVideoMinimized ? 'none' : 'auto',
              }}
            >
              <VideoPlayerMini
                video={{
                  id: currentlyPlaying.media.id,
                  title: currentlyPlaying.media.title,
                  description: currentlyPlaying.media.description,
                  url: currentlyPlaying.media.url || '',
                  duration: currentlyPlaying.media.duration,
                  thumbnail_url: currentlyPlaying.media.thumbnail_url,
                }}
                videoSize={videoSize}
                isCinemaMode={isCinemaMode}
                onCinemaMode={() => setIsCinemaMode(!isCinemaMode)}
                onResize={() => {
                  const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large']
                  const currentIndex = sizes.indexOf(videoSize)
                  const nextIndex = (currentIndex + 1) % sizes.length
                  setVideoSize(sizes[nextIndex])
                }}
              />
              <div
                style={{
                  padding: theme.spacing.sm,
                  backgroundColor: theme.colors.bgTertiary,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: theme.fontSizes.sm,
                    fontWeight: 600,
                    color: theme.colors.textPrimary,
                    marginBottom: theme.spacing.xs,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {currentlyPlaying.media.title}
                </div>
                {currentlyPlaying.media.description && (
                  <div
                    style={{
                      fontSize: theme.fontSizes.xs,
                      color: theme.colors.textSecondary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {currentlyPlaying.media.description}
                  </div>
                )}
              </div>
            </div>
            {isVideoMinimized && (
              <div
                style={{
                  padding: theme.spacing.md,
                  textAlign: 'center',
                  color: theme.colors.textPrimary,
                }}
              >
                <div style={{ fontSize: theme.fontSizes.sm, fontWeight: 600, marginBottom: theme.spacing.xs }}>
                  {currentlyPlaying.media.title}
                </div>
                <div style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary }}>
                  Vidéo minimisée - Cliquez pour agrandir
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }

  // Audio player - utiliser la nouvelle barre complète
  if (currentlyPlaying.type === 'audio') {
    return <PlayerBarFull />
  }

  // Video player - utiliser aussi la nouvelle barre complète en bas, mais garder le mini player en bas à droite
  if (currentlyPlaying.type === 'video') {
    return (
      <>
        {/* Mini player vidéo en bas à droite */}
        <div style={videoPlayerContainerStyle}>
          <div style={{ position: 'relative', width: '100%', height: '100%', flex: 1, overflow: 'hidden' }}>
            {/* Resize handles - code existant */}
            {!isVideoMinimized && !isCinemaMode && (
              <>
                {/* Resize handle - horizontal (left side maintenant que le lecteur est à droite) */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0, // Changé de right: 0 à left: 0
                    width: '20px',
                    height: '100%',
                    cursor: 'ew-resize',
                    zIndex: 15,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    transition: theme.transitions.base,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.bgTertiary + '40'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    const startX = e.clientX
                    const startWidth = parseInt(getVideoWidth(), 10)
                    
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const diff = startX - moveEvent.clientX // Inversé car on redimensionne depuis la gauche
                      const newWidth = Math.max(400, Math.min(1200, startWidth + diff))
                      if (newWidth <= 500) {
                        setVideoSize('small')
                      } else if (newWidth <= 700) {
                        setVideoSize('medium')
                      } else {
                        setVideoSize('large')
                      }
                    }
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove)
                      document.removeEventListener('mouseup', handleMouseUp)
                    }
                    
                    document.addEventListener('mousemove', handleMouseMove)
                    document.addEventListener('mouseup', handleMouseUp)
                  }}
                  title="Redimensionner la largeur"
                >
                  <div
                    style={{
                      color: theme.colors.textSecondary,
                      fontSize: theme.fontSizes.sm,
                      pointerEvents: 'none',
                    }}
                  >
                    ⇄
                  </div>
                </div>

                {/* Resize handle - vertical (top side) */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '20px', // Leave space for horizontal resize handle (maintenant à gauche)
                    right: 0,
                    height: '20px',
                    cursor: 'ns-resize',
                    zIndex: 15,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    transition: theme.transitions.base,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.bgTertiary + '40'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    const startY = e.clientY
                    const startHeight = videoHeight
                    
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const diff = startY - moveEvent.clientY
                      const newHeight = Math.max(300, Math.min(window.innerHeight - 100, startHeight + diff))
                      setVideoHeight(newHeight)
                    }
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove)
                      document.removeEventListener('mouseup', handleMouseUp)
                    }
                    
                    document.addEventListener('mousemove', handleMouseMove)
                    document.addEventListener('mouseup', handleMouseUp)
                  }}
                  title="Redimensionner la hauteur"
                >
                  <div
                    style={{
                      color: theme.colors.textSecondary,
                      fontSize: theme.fontSizes.sm,
                      pointerEvents: 'none',
                    }}
                  >
                    ⇅
                  </div>
                </div>

                {/* Resize handle - corner (top-left maintenant que le lecteur est à droite) */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0, // Changé de right: 0 à left: 0
                    width: '20px',
                    height: '20px',
                    cursor: 'nesw-resize', // Changé de nwse-resize à nesw-resize pour le coin gauche
                    zIndex: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.bgTertiary + '60',
                    transition: theme.transitions.base,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.bgTertiary + '80'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.bgTertiary + '60'
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    const startX = e.clientX
                    const startY = e.clientY
                    const startWidth = parseInt(getVideoWidth(), 10)
                    const startHeight = videoHeight
                    
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const diffX = startX - moveEvent.clientX // Inversé car on redimensionne depuis la gauche
                      const diffY = startY - moveEvent.clientY
                      
                      const newWidth = Math.max(400, Math.min(1200, startWidth + diffX))
                      if (newWidth <= 500) {
                        setVideoSize('small')
                      } else if (newWidth <= 700) {
                        setVideoSize('medium')
                      } else {
                        setVideoSize('large')
                      }
                      
                      const newHeight = Math.max(300, Math.min(window.innerHeight - 100, startHeight + diffY))
                      setVideoHeight(newHeight)
                    }
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove)
                      document.removeEventListener('mouseup', handleMouseUp)
                    }
                    
                    document.addEventListener('mousemove', handleMouseMove)
                    document.addEventListener('mouseup', handleMouseUp)
                  }}
                  title="Redimensionner (largeur et hauteur)"
                >
                  <div
                    style={{
                      color: theme.colors.textPrimary,
                      fontSize: theme.fontSizes.xs,
                      pointerEvents: 'none',
                    }}
                  >
                    ⤢
                  </div>
                </div>
              </>
            )}
            
            <div
              style={{
                position: 'absolute',
                top: theme.spacing.xs,
                left: isVideoMinimized || isCinemaMode ? theme.spacing.xs : '30px', // Changé de right à left
                right: 'auto',
                zIndex: 10,
                display: 'flex',
                gap: theme.spacing.xs,
              }}
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsVideoMinimized(!isVideoMinimized)}
                style={{
                  minWidth: 'auto',
                  padding: theme.spacing.xs,
                  backgroundColor: theme.colors.bgTertiary + 'CC',
                  border: `1px solid ${theme.colors.borderPrimary}`,
                }}
                title={isVideoMinimized ? 'Agrandir' : 'Minimiser'}
              >
                {isVideoMinimized ? '⬆️' : '⬇️'}
              </Button>
            </div>
            <div 
              style={{ 
                flex: 1, 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column',
                visibility: isVideoMinimized ? 'hidden' : 'visible',
                position: isVideoMinimized ? 'absolute' : 'relative',
                width: isVideoMinimized ? '1px' : '100%',
                height: isVideoMinimized ? '1px' : 'auto',
                opacity: isVideoMinimized ? 0 : 1,
                pointerEvents: isVideoMinimized ? 'none' : 'auto',
              }}
            >
              <VideoPlayerMini
                video={{
                  id: currentlyPlaying.media.id,
                  title: currentlyPlaying.media.title,
                  description: currentlyPlaying.media.description,
                  url: currentlyPlaying.media.url || '',
                  duration: currentlyPlaying.media.duration,
                  thumbnail_url: currentlyPlaying.media.thumbnail_url,
                }}
                videoSize={videoSize}
                isCinemaMode={isCinemaMode}
                onCinemaMode={() => setIsCinemaMode(!isCinemaMode)}
                onResize={() => {
                  const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large']
                  const currentIndex = sizes.indexOf(videoSize)
                  const nextIndex = (currentIndex + 1) % sizes.length
                  setVideoSize(sizes[nextIndex])
                }}
              />
            </div>
            {isVideoMinimized && (
              <div
                style={{
                  padding: theme.spacing.md,
                  textAlign: 'center',
                  color: theme.colors.textPrimary,
                }}
              >
                <div style={{ fontSize: theme.fontSizes.sm, fontWeight: 600, marginBottom: theme.spacing.xs }}>
                  {currentlyPlaying.media.title}
                </div>
                <div style={{ fontSize: theme.fontSizes.xs, color: theme.colors.textSecondary }}>
                  Vidéo minimisée - Cliquez pour agrandir
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Barre de contrôle en bas pour la vidéo */}
        <PlayerBarFull />
      </>
    )
  }

  return null
}

export default PlayerBar
