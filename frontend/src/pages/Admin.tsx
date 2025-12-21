import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import MediaUploadForm from '../components/admin/MediaUploadForm'
import EditMediaModal from '../components/admin/EditMediaModal'
import BulkMediaImporter from '../components/admin/BulkMediaImporter'
import { mediaService, MediaItem } from '../services/media.service'
import { usePlayer } from '../contexts/PlayerContext'
import { theme } from '../styles/theme'
import { Card, Button } from '../components/ui'

const Admin: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { play } = usePlayer()
  const [recentMedia, setRecentMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [showBulkImporter, setShowBulkImporter] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Charger les médias récents
    loadRecentMedia()
  }, [isAuthenticated, navigate])

  const loadRecentMedia = async () => {
    setLoading(true)
    try {
      const result = await mediaService.getAll({ limit: 10 })
      setRecentMedia(result.data)
    } catch (error) {
      console.error('Error loading media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = async (media: MediaItem) => {
    // Recharger la liste des médias récents
    await loadRecentMedia()
    
    // Optionnel : lancer la lecture
    // play(media)
  }

  const handlePlayMedia = (media: MediaItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    play(media)
  }

  const handleEditMedia = (media: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedMedia(media)
  }

  const handleCloseModal = () => {
    setSelectedMedia(null)
  }

  const handleUpdateSuccess = async () => {
    await loadRecentMedia()
  }

  const handleDeleteSuccess = async () => {
    await loadRecentMedia()
  }

  if (!isAuthenticated) {
    return null
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
  }

  const headerStyle: React.CSSProperties = {
    marginBottom: theme.spacing['2xl'],
  }

  const titleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes['4xl'],
    fontWeight: 700,
    marginBottom: theme.spacing.md,
    background: theme.colors.gradientPrimary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }

  const subtitleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.textSecondary,
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

  const mediaListStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: theme.spacing.lg,
  }

  const mediaCardStyle: React.CSSProperties = {
    backgroundColor: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    border: `1px solid ${theme.colors.borderPrimary}`,
    cursor: 'pointer',
    transition: theme.transitions.base,
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Zone Administrateur</h1>
        <p style={subtitleStyle}>
          Gérez votre bibliothèque de médias - Ajoutez des fichiers audio et vidéo
        </p>
      </div>

      {/* Upload Form */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center', marginBottom: theme.spacing.md }}>
          <MediaUploadForm onUploadSuccess={handleUploadSuccess} />
          <Button
            variant="secondary"
            onClick={() => setShowBulkImporter(true)}
            style={{
              whiteSpace: 'nowrap',
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            }}
          >
            📊 Importer depuis la base de données
          </Button>
        </div>
      </div>

      {/* Recent Media */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Médias Récents</h2>
        {loading ? (
          <div style={{ color: theme.colors.textSecondary }}>Chargement...</div>
        ) : recentMedia.length === 0 ? (
          <div style={{ color: theme.colors.textSecondary }}>
            Aucun média pour le moment. Commencez par uploader un fichier !
          </div>
        ) : (
          <div style={mediaListStyle}>
            {recentMedia.map((media) => (
              <Card
                key={media.id}
                style={mediaCardStyle}
                onClick={(e) => handleEditMedia(media, e)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = theme.shadows.glow
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.borderPrimary
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {media.thumbnail_url && (
                  <img
                    src={media.thumbnail_url}
                    alt={media.title}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      objectFit: 'cover',
                      borderRadius: theme.borderRadius.sm,
                      marginBottom: theme.spacing.sm,
                    }}
                  />
                )}
                <div
                  style={{
                    fontSize: theme.fontSizes.sm,
                    fontWeight: 600,
                    marginBottom: theme.spacing.xs,
                    color: theme.colors.textPrimary,
                  }}
                >
                  {media.title}
                </div>
                {media.artist && (
                  <div
                    style={{
                      fontSize: theme.fontSizes.xs,
                      color: theme.colors.textSecondary,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {media.artist}
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: theme.spacing.sm,
                  }}
                >
                  <span
                    style={{
                      fontSize: theme.fontSizes.xs,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {media.type === 'music' ? '🎵' : '🎬'}
                  </span>
                  <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditMedia(media, e)
                      }}
                      title="Modifier"
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
                      ✏️
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlayMedia(media, e)
                      }}
                      style={{
                        minWidth: '44px',
                        height: '44px',
                        padding: 0,
                        fontSize: theme.fontSizes.lg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: theme.shadows.glow,
                        borderRadius: theme.borderRadius.md,
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.08)'
                        e.currentTarget.style.boxShadow = theme.shadows.glow
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)'
                        e.currentTarget.style.boxShadow = theme.shadows.glow
                      }}
                    >
                      ▶️
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Media Modal */}
      {selectedMedia && (
        <EditMediaModal
          media={selectedMedia}
          onClose={handleCloseModal}
          onUpdate={handleUpdateSuccess}
          onDelete={handleDeleteSuccess}
        />
      )}

      {/* Bulk Media Importer */}
      <BulkMediaImporter
        isOpen={showBulkImporter}
        onClose={() => setShowBulkImporter(false)}
        onImportSuccess={handleUploadSuccess}
      />
    </div>
  )
}

export default Admin

