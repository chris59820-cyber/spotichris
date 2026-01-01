import React, { useRef, useState, useEffect } from 'react'
import { theme } from '../../styles/theme'

interface VideoPlayerProps {
  src?: string
  title?: string
  poster?: string
  autoplay?: boolean
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  poster,
  autoplay = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(document.fullscreenElement || (document as any).webkitFullscreenElement)
      )
    }

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)

    video.volume = volume

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [volume])

  const togglePlayPause = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const seek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const setVolumeLevel = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume))
    setVolume(clampedVolume)
    if (videoRef.current) {
      videoRef.current.volume = clampedVolume
    }
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      } else if ((videoRef.current as any).webkitRequestFullscreen) {
        ;(videoRef.current as any).webkitRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        ;(document as any).webkitExitFullscreen()
      }
    }
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
    backgroundColor: theme.colors.bgPrimary,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  }

  const videoStyle: React.CSSProperties = {
    width: '100%',
    height: 'auto',
    display: 'block',
  }

  const controlsStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: theme.spacing.md,
    display: showControls ? 'flex' : 'none',
    flexDirection: 'column',
    gap: theme.spacing.sm,
    transition: theme.transitions.base,
  }

  const controlsRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
  }

  const buttonStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: theme.borderRadius.md,
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: theme.colors.textPrimary,
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
    color: theme.colors.textPrimary,
    minWidth: '80px',
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    seek(percent * duration)
  }

  if (!src) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            padding: theme.spacing['2xl'],
            textAlign: 'center',
            color: theme.colors.textTertiary,
          }}
        >
          Aucune vidéo sélectionnée
        </div>
      </div>
    )
  }

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        // Hide controls after a delay if playing
        if (isPlaying) {
          setTimeout(() => setShowControls(false), 3000)
        }
      }}
    >
      {title && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            padding: theme.spacing.md,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: theme.colors.textPrimary,
            fontSize: theme.fontSizes.lg,
            fontWeight: 600,
          }}
        >
          {title}
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        style={videoStyle}
        onClick={togglePlayPause}
        autoPlay={autoplay}
      />
      <div style={controlsStyle}>
        {/* Progress Bar */}
        <div
          style={progressBarStyle}
          onClick={handleProgressClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
          }}
        >
          <div style={progressFillStyle} />
        </div>

        {/* Controls Row */}
        <div style={controlsRowStyle}>
          <button
            style={buttonStyle}
            onClick={togglePlayPause}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>

          <div style={timeStyle}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              flex: 1,
            }}
          >
            <span style={{ color: theme.colors.textPrimary, fontSize: theme.fontSizes.sm }}>
              🔊
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
              style={{
                flex: 1,
                maxWidth: '150px',
              }}
            />
          </div>

          <button
            style={buttonStyle}
            onClick={toggleFullscreen}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'
            }}
          >
            {isFullscreen ? '🗗' : '🗖'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer






