import React, { useState, useEffect } from 'react'
import { theme } from '../../styles/theme'
import { MediaItem } from '../../services/search.service'
import Card from '../../components/ui/Card'
import { usePlayer } from '../../contexts/PlayerContext'
import { useAuth } from '../../features/auth/AuthContext'
import { favoritesService } from '../../services/favorites.service'
import AddToPlaylistModal from '../../components/playlist/AddToPlaylistModal'
import Button from '../../components/ui/Button'

interface SearchResultsProps {
  music: MediaItem[]
  video: MediaItem[]
  loading?: boolean
}

const SearchResults: React.FC<SearchResultsProps> = ({ music, video, loading }) => {
  const { currentlyPlaying, isPlaying, play } = usePlayer()
  const { isAuthenticated } = useAuth()
  const [favoriteStatuses, setFavoriteStatuses] = useState<Record<number, boolean>>({})
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false)
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null)

  // Charger les statuts favoris quand les résultats changent
  useEffect(() => {
    const loadFavoriteStatuses = async () => {
      if (!isAuthenticated) return

      const allMedia = [...music, ...video]
      const mediaIds = allMedia.map((m) => m.id)
      if (mediaIds.length > 0) {
        try {
          const statuses = await favoritesService.getFavoriteStatuses(mediaIds)
          setFavoriteStatuses(statuses)
        } catch (error) {
          console.warn('Error loading favorite statuses:', error)
        }
      }
    }

    loadFavoriteStatuses()
  }, [music, video, isAuthenticated])

  const sectionStyle: React.CSSProperties = {
    marginBottom: theme.spacing['2xl'],
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: 600,
    marginBottom: theme.spacing.lg,
    color: theme.colors.textPrimary,
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: theme.spacing.lg,
  }

  const MediaCard: React.FC<{ item: MediaItem }> = ({ item }) => {
    const isCurrentlyPlaying = currentlyPlaying?.media.id === item.id && isPlaying
    const [isFavorite, setIsFavorite] = useState(favoriteStatuses[item.id] || false)
    const [togglingFavorite, setTogglingFavorite] = useState(false)

    const handleAddToPlaylist = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!isAuthenticated) {
        alert('Vous devez être connecté pour ajouter des médias aux playlists')
        return
      }
      setSelectedMediaId(item.id)
      setShowAddToPlaylistModal(true)
    }

    const formatDuration = (seconds?: number) => {
      if (!seconds) return ''
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handlePlay = () => {
      if (item.url) {
        play(item)
      }
    }

    const handleToggleFavorite = async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!isAuthenticated) {
        alert('Vous devez être connecté pour ajouter des favoris')
        return
      }

      setTogglingFavorite(true)
      try {
        const result = await favoritesService.toggleFavorite(item.id)
        setIsFavorite(result.is_favorite)
        setFavoriteStatuses((prev) => ({
          ...prev,
          [item.id]: result.is_favorite,
        }))
      } catch (error) {
        console.error('Error toggling favorite:', error)
        alert('Erreur lors de la mise à jour des favoris')
      } finally {
        setTogglingFavorite(false)
      }
    }

    useEffect(() => {
      setIsFavorite(favoriteStatuses[item.id] || false)
    }, [favoriteStatuses, item.id])

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
              item.type === 'music' ? '🎵' : '🎬'
            )}
          </div>
          <h3
            style={{
              color: theme.colors.textPrimary,
              marginBottom: theme.spacing.xs,
              fontSize: theme.fontSizes.base,
              fontWeight: 600,
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
            {/* Boutons actions en dessous de l'image */}
            <div style={{ display: 'flex', gap: theme.spacing.xs, alignItems: 'center' }}>
              {item.type === 'music' && item.url && (
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
                  {isCurrentlyPlaying ? '⏸' : '▶'}
                </Button>
              )}
              {item.type === 'video' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (item.url) {
                      play(item)
                    }
                  }}
                  style={{
                    minWidth: 'auto',
                    height: '44px',
                    padding: `0 ${theme.spacing.md}`,
                    fontSize: theme.fontSizes.sm,
                    fontWeight: 600,
                    boxShadow: theme.shadows.glow,
                    borderRadius: theme.borderRadius.md,
                    transition: 'all 0.2s ease',
                  }}
                  title="Regarder"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = theme.shadows.glow
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = theme.shadows.glow
                  }}
                >
                  ▶️ Regarder
                </Button>
              )}
              {isAuthenticated && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleAddToPlaylist}
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
                    variant={isFavorite ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={handleToggleFavorite}
                    disabled={togglingFavorite}
                    style={{
                      backgroundColor: isFavorite ? theme.colors.primary : theme.colors.bgSecondary,
                      border: `2px solid ${isFavorite ? theme.colors.primary : theme.colors.borderPrimary}`,
                      minWidth: '44px',
                      height: '44px',
                      padding: 0,
                      fontSize: theme.fontSizes.lg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isFavorite ? theme.shadows.glow : 'none',
                      color: isFavorite ? theme.colors.textInverse : theme.colors.textPrimary,
                      borderRadius: theme.borderRadius.md,
                      transition: 'all 0.2s ease',
                    }}
                    title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    onMouseEnter={(e) => {
                      if (!togglingFavorite) {
                        e.currentTarget.style.transform = 'scale(1.08)'
                        e.currentTarget.style.boxShadow = theme.shadows.glow
                        if (!isFavorite) {
                          e.currentTarget.style.backgroundColor = theme.colors.primary
                          e.currentTarget.style.borderColor = theme.colors.primary
                          e.currentTarget.style.color = theme.colors.textInverse
                        }
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!togglingFavorite) {
                        e.currentTarget.style.transform = 'scale(1)'
                        if (!isFavorite) {
                          e.currentTarget.style.backgroundColor = theme.colors.bgSecondary
                          e.currentTarget.style.borderColor = theme.colors.borderPrimary
                          e.currentTarget.style.color = theme.colors.textPrimary
                          e.currentTarget.style.boxShadow = 'none'
                        } else {
                          e.currentTarget.style.boxShadow = theme.shadows.glow
                        }
                      }
                    }}
                  >
                    {togglingFavorite ? '⏳' : isFavorite ? '⭐' : '☆'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
        <p style={{ color: theme.colors.textSecondary }}>Recherche en cours...</p>
      </div>
    )
  }

  const hasResults = music.length > 0 || video.length > 0

  if (!hasResults) {
    return (
      <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
        <p style={{ color: theme.colors.textSecondary }}>Aucun résultat trouvé</p>
      </div>
    )
  }

  return (
    <div>
      {music.length > 0 && (
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Musique ({music.length})</h2>
          <div style={gridStyle}>
            {music.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {video.length > 0 && (
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Vidéo ({video.length})</h2>
          <div style={gridStyle}>
            {video.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </section>
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

export default SearchResults

