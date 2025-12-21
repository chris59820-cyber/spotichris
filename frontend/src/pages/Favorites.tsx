import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { favoritesService } from '../services/favorites.service'
import { mediaService, MediaItem } from '../services/media.service'
import { usePlayer } from '../contexts/PlayerContext'
import { theme } from '../styles/theme'
import { Card, Button } from '../components/ui'
import AddToPlaylistModal from '../components/playlist/AddToPlaylistModal'

const Favorites: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { play, currentlyPlaying, isPlaying } = usePlayer()
  const [favorites, setFavorites] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [favoriteStatuses, setFavoriteStatuses] = useState<Record<number, boolean>>({})
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false)
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    loadFavorites()
  }, [isAuthenticated, navigate])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const favoritesData = await favoritesService.getUserFavorites()
      
      // Convertir les données en MediaItem
      const mediaItems: MediaItem[] = favoritesData.map((fav: any) => ({
        id: fav.id,
        title: fav.title,
        description: fav.description,
        artist: fav.artist,
        album: fav.album,
        duration: fav.duration,
        type: fav.type,
        url: fav.url,
        thumbnail_url: fav.thumbnail_url,
        video_category: fav.video_category,
        music_category: fav.music_category,
        created_at: fav.created_at,
      }))
      
      setFavorites(mediaItems)
      
      // Tous les médias sont favoris
      const statuses: Record<number, boolean> = {}
      mediaItems.forEach((item) => {
        statuses[item.id] = true
      })
      setFavoriteStatuses(statuses)
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async (mediaId: number) => {
    try {
      const result = await favoritesService.toggleFavorite(mediaId)
      if (!result.is_favorite) {
        // Retirer de la liste si ce n'est plus un favori
        setFavorites((prev) => prev.filter((item) => item.id !== mediaId))
      }
      setFavoriteStatuses((prev) => ({
        ...prev,
        [mediaId]: result.is_favorite,
      }))
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Erreur lors de la mise à jour des favoris')
    }
  }

  const handleAddToPlaylist = (mediaId: number) => {
    setSelectedMediaId(mediaId)
    setShowAddToPlaylistModal(true)
  }

  if (!isAuthenticated) {
    return null
  }

  const containerStyle: React.CSSProperties = {
    padding: theme.spacing.xl,
  }

  const titleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes['4xl'],
    fontWeight: 700,
    marginBottom: theme.spacing.xl,
    background: theme.colors.gradientPrimary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: theme.spacing.lg,
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const MediaCard: React.FC<{ item: MediaItem }> = ({ item }) => {
    const isCurrentlyPlaying = currentlyPlaying?.media.id === item.id && isPlaying
    const isFavorite = favoriteStatuses[item.id] || false
    const [togglingFavorite, setTogglingFavorite] = useState(false)

    const handlePlay = () => {
      if (item.url) {
        play(item)
      } else {
        alert('Aucune URL de média disponible pour ce contenu')
      }
    }

    const handleToggleFavoriteClick = async (e: React.MouseEvent) => {
      e.stopPropagation()
      setTogglingFavorite(true)
      await handleToggleFavorite(item.id)
      setTogglingFavorite(false)
    }

    return (
      <Card hoverable>
        <div style={{ padding: theme.spacing.md }}>
          <div
            style={{
              width: '100%',
              aspectRatio: '1',
              backgroundColor: theme.colors.bgTertiary,
              borderRadius: theme.borderRadius.md,
              marginBottom: theme.spacing.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.textTertiary,
              cursor: 'pointer',
            }}
            onClick={handlePlay}
          >
            {item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: theme.borderRadius.md }}
              />
            ) : (
              <div style={{ fontSize: '4rem' }}>{item.type === 'music' ? '🎵' : '🎬'}</div>
            )}
          </div>
          <h3
            style={{
              color: theme.colors.textPrimary,
              marginBottom: theme.spacing.xs,
              fontSize: theme.fontSizes.base,
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.title}
          </h3>
          {item.artist && (
            <p
              style={{
                color: theme.colors.textSecondary,
                fontSize: theme.fontSizes.sm,
                marginBottom: theme.spacing.xs,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.artist}
            </p>
          )}
          {item.album && (
            <p
              style={{
                color: theme.colors.textTertiary,
                fontSize: theme.fontSizes.xs,
                marginBottom: theme.spacing.xs,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.album}
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: theme.spacing.sm }}>
            {item.duration && (
              <p
                style={{
                  color: theme.colors.textTertiary,
                  fontSize: theme.fontSizes.xs,
                  fontWeight: 500,
                }}
              >
                {formatDuration(item.duration)}
              </p>
            )}
            {/* Boutons actions */}
            <div style={{ display: 'flex', gap: theme.spacing.xs, alignItems: 'center' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePlay()
                }}
                style={{
                  minWidth: '44px',
                  height: '44px',
                  padding: 0,
                  fontSize: theme.fontSizes.xl,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: theme.shadows.glow,
                  borderRadius: theme.borderRadius.md,
                  transition: 'all 0.2s ease',
                }}
                title={isCurrentlyPlaying ? 'Pause' : 'Lecture'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.08)'
                  e.currentTarget.style.boxShadow = theme.shadows.glow
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = theme.shadows.glow
                }}
              >
                {isCurrentlyPlaying ? '⏸' : item.type === 'music' ? '▶' : '▶️'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAddToPlaylist(item.id)
                }}
                style={{
                  backgroundColor: theme.colors.bgSecondary,
                  border: `2px solid ${theme.colors.borderPrimary}`,
                  minWidth: '44px',
                  height: '44px',
                  padding: 0,
                  fontSize: theme.fontSizes.lg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme.borderRadius.md,
                  transition: 'all 0.2s ease',
                  color: theme.colors.textPrimary,
                }}
                title="Ajouter à une playlist"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.08)'
                  e.currentTarget.style.backgroundColor = theme.colors.primary
                  e.currentTarget.style.borderColor = theme.colors.primary
                  e.currentTarget.style.color = theme.colors.textInverse
                  e.currentTarget.style.boxShadow = theme.shadows.glow
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.backgroundColor = theme.colors.bgSecondary
                  e.currentTarget.style.borderColor = theme.colors.borderPrimary
                  e.currentTarget.style.color = theme.colors.textPrimary
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                📋
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleToggleFavoriteClick}
                disabled={togglingFavorite}
                style={{
                  backgroundColor: theme.colors.primary,
                  border: `2px solid ${theme.colors.primary}`,
                  minWidth: '44px',
                  height: '44px',
                  padding: 0,
                  fontSize: theme.fontSizes.lg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: theme.shadows.glow,
                  color: theme.colors.textInverse,
                  borderRadius: theme.borderRadius.md,
                  transition: 'all 0.2s ease',
                }}
                title="Retirer des favoris"
                onMouseEnter={(e) => {
                  if (!togglingFavorite) {
                    e.currentTarget.style.transform = 'scale(1.08)'
                    e.currentTarget.style.boxShadow = theme.shadows.glow
                  }
                }}
                onMouseLeave={(e) => {
                  if (!togglingFavorite) {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = theme.shadows.glow
                  }
                }}
              >
                {togglingFavorite ? '⏳' : '⭐'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <h1 style={titleStyle}>Mes Favoris</h1>
        <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
          <p style={{ color: theme.colors.textSecondary }}>Chargement de vos favoris...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Mes Favoris</h1>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
          <div style={{ fontSize: '4rem', marginBottom: theme.spacing.md }}>⭐</div>
          <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.md }}>
            Vous n'avez pas encore de favoris
          </p>
          <p style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm }}>
            Cliquez sur l'étoile ⭐ sur les médias pour les ajouter à vos favoris
          </p>
        </div>
      ) : (
        <div style={gridStyle}>
          {favorites.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}

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
    </div>
  )
}

export default Favorites

