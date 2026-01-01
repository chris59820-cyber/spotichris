import React, { useState, useEffect } from 'react'
import { playlistService, Playlist } from '../../services/playlist.service'
import { Button } from '../ui'
import { theme } from '../../styles/theme'

interface AddToPlaylistModalProps {
  mediaId: number
  onClose: () => void
  onSuccess?: () => void
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ mediaId, onClose, onSuccess }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const data = await playlistService.getAll()
        setPlaylists(data)
      } catch (err: any) {
        setError('Erreur lors du chargement des playlists')
        console.error('Error loading playlists:', err)
      } finally {
        setLoading(false)
      }
    }

    loadPlaylists()
  }, [])

  const handleAddToPlaylist = async (playlistId: number) => {
    setAdding(playlistId)
    setError('')
    try {
      await playlistService.addMedia(playlistId, mediaId)
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur lors de l\'ajout à la playlist'
      setError(message)
      console.error('Error adding to playlist:', err)
    } finally {
      setAdding(null)
    }
  }

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: theme.zIndex.modal,
  }

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: theme.colors.bgPrimary,
    padding: theme.spacing['2xl'],
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.borderPrimary}`,
    width: '90%',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflowY: 'auto',
    position: 'relative',
    boxShadow: theme.shadows.lg,
  }

  const titleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: 700,
    marginBottom: theme.spacing.xl,
    background: theme.colors.gradientPrimary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: theme.spacing.md,
            right: theme.spacing.md,
            backgroundColor: 'transparent',
            border: 'none',
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes.xl,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>

        <h2 style={titleStyle}>Ajouter à une playlist</h2>

        {error && (
          <div
            style={{
              padding: theme.spacing.md,
              marginBottom: theme.spacing.md,
              backgroundColor: theme.colors.error + '20',
              border: `1px solid ${theme.colors.error}`,
              borderRadius: theme.borderRadius.md,
              color: theme.colors.error,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
            <p style={{ color: theme.colors.textSecondary }}>Chargement des playlists...</p>
          </div>
        ) : playlists.length === 0 ? (
          <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
            <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.md }}>
              Vous n'avez pas encore de playlist
            </p>
            <p style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.sm }}>
              Créez-en une depuis la page Bibliothèque
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.bgSecondary,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.borderPrimary}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: theme.fontSizes.base,
                      fontWeight: 600,
                      color: theme.colors.textPrimary,
                      marginBottom: theme.spacing.xs,
                    }}
                  >
                    {playlist.name}
                    {playlist.is_public && (
                      <span style={{ marginLeft: theme.spacing.xs, fontSize: theme.fontSizes.xs }}>
                        🌐
                      </span>
                    )}
                  </div>
                  {playlist.description && (
                    <div
                      style={{
                        fontSize: theme.fontSizes.sm,
                        color: theme.colors.textSecondary,
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      {playlist.description}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: theme.fontSizes.xs,
                      color: theme.colors.textTertiary,
                    }}
                  >
                    {playlist.item_count || 0} média{playlist.item_count !== 1 ? 's' : ''}
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                  disabled={adding === playlist.id}
                >
                  {adding === playlist.id ? '⏳' : '➕'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AddToPlaylistModal






