import React, { useEffect, useState } from 'react'
import { theme } from '../styles/theme'
import Card from '../components/ui/Card'
import { mediaService, MediaItem } from '../services/media.service'
import { usePlayer } from '../contexts/PlayerContext'
import { useAuth } from '../features/auth/AuthContext'
import { favoritesService } from '../services/favorites.service'
import AddToPlaylistModal from '../components/playlist/AddToPlaylistModal'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const musicCategories = ['Pop', 'Rock', 'Jazz', 'Classique', 'Hip-Hop', 'Électronique', 'Rap', 'R&B', 'Country', 'Reggae', 'Metal', 'Blues', 'Folk', 'World', 'Autre']
const videoCategories = ['Cinéma', 'Série', 'Documentaire', 'Musique', 'Sport']

const Home: React.FC = () => {
  const [musicMedia, setMusicMedia] = useState<MediaItem[]>([])
  const [videoMedia, setVideoMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [favoriteStatuses, setFavoriteStatuses] = useState<Record<number, boolean>>({})
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false)
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null)
  const { play, currentlyPlaying, isPlaying } = usePlayer()
  const { isAuthenticated } = useAuth()

  // Filtres musique
  const [musicArtistFilter, setMusicArtistFilter] = useState('')
  const [musicCategoryFilter, setMusicCategoryFilter] = useState('')

  // Filtres vidéo
  const [videoCategoryFilter, setVideoCategoryFilter] = useState('')

  useEffect(() => {
    const loadMedia = async () => {
      try {
        setLoading(true)
        const musicParams: any = { type: 'music', limit: 50 }
        if (musicArtistFilter) musicParams.artist = musicArtistFilter
        if (musicCategoryFilter) musicParams.music_category = musicCategoryFilter

        const videoParams: any = { type: 'video', limit: 50 }
        if (videoCategoryFilter) videoParams.video_category = videoCategoryFilter

        const [musicResult, videoResult] = await Promise.all([
          mediaService.getAll(musicParams),
          mediaService.getAll(videoParams),
        ])
        setMusicMedia(musicResult.data || [])
        setVideoMedia(videoResult.data || [])

        // Charger les statuts favoris si l'utilisateur est authentifié
        if (isAuthenticated) {
          const allMedia = [...(musicResult.data || []), ...(videoResult.data || [])]
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
      } catch (error) {
        console.error('Error loading media:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMedia()
  }, [isAuthenticated, musicArtistFilter, musicCategoryFilter, videoCategoryFilter])

  const pageStyle: React.CSSProperties = {
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
      } else {
        alert('Aucune URL de média disponible pour ce contenu')
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
        // Mettre à jour le statut dans l'état global
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

    // Mettre à jour le statut favori quand favoriteStatuses change
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
            {/* Boutons actions en dessous de l'image */}
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
      <div style={pageStyle}>
        <h1 style={titleStyle}>Bienvenue sur Spotichris</h1>
        <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
          <p style={{ color: theme.colors.textSecondary }}>Chargement des contenus...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Bienvenue sur Spotichris</h1>

      {musicMedia.length > 0 && (
        <section style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
            <h2 style={sectionTitleStyle}>Musique</h2>
            <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
              <Input
                placeholder="Filtrer par artiste..."
                value={musicArtistFilter}
                onChange={(e) => setMusicArtistFilter(e.target.value)}
                style={{
                  width: '200px',
                  padding: theme.spacing.sm,
                  fontSize: theme.fontSizes.sm,
                }}
              />
              <select
                value={musicCategoryFilter}
                onChange={(e) => setMusicCategoryFilter(e.target.value)}
                style={{
                  padding: theme.spacing.sm,
                  backgroundColor: theme.colors.bgSecondary,
                  border: `2px solid ${theme.colors.borderPrimary}`,
                  borderRadius: theme.borderRadius.md,
                  color: theme.colors.textPrimary,
                  fontSize: theme.fontSizes.sm,
                  fontFamily: theme.fonts.primary,
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '150px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary
                  e.currentTarget.style.boxShadow = theme.shadows.glow
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.borderPrimary
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <option value="">Tous les genres</option>
                {musicCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {(musicArtistFilter || musicCategoryFilter) && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setMusicArtistFilter('')
                    setMusicCategoryFilter('')
                  }}
                  style={{ padding: `${theme.spacing.xs} ${theme.spacing.sm}` }}
                >
                  ✕ Réinitialiser
                </Button>
              )}
            </div>
          </div>
          <div style={gridStyle}>
            {musicMedia.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {videoMedia.length > 0 && (
        <section style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
            <h2 style={sectionTitleStyle}>Vidéo</h2>
            <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center' }}>
              <select
                value={videoCategoryFilter}
                onChange={(e) => setVideoCategoryFilter(e.target.value)}
                style={{
                  padding: theme.spacing.sm,
                  backgroundColor: theme.colors.bgSecondary,
                  border: `2px solid ${theme.colors.borderPrimary}`,
                  borderRadius: theme.borderRadius.md,
                  color: theme.colors.textPrimary,
                  fontSize: theme.fontSizes.sm,
                  fontFamily: theme.fonts.primary,
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '150px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary
                  e.currentTarget.style.boxShadow = theme.shadows.glow
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.borderPrimary
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <option value="">Tous les types</option>
                {videoCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {videoCategoryFilter && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setVideoCategoryFilter('')}
                  style={{ padding: `${theme.spacing.xs} ${theme.spacing.sm}` }}
                >
                  ✕ Réinitialiser
                </Button>
              )}
            </div>
          </div>
          <div style={gridStyle}>
            {videoMedia.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {musicMedia.length === 0 && videoMedia.length === 0 && (
        <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
          <p style={{ color: theme.colors.textSecondary }}>
            Aucun contenu disponible. Assurez-vous que la base de données est initialisée.
          </p>
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

export default Home
