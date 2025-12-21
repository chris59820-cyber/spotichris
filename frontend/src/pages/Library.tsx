import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { playlistService, Playlist } from '../services/playlist.service'
import { usePlayer } from '../contexts/PlayerContext'
import CreatePlaylistModal from '../components/playlist/CreatePlaylistModal'
import { theme } from '../styles/theme'
import { Button, Card } from '../components/ui'

const Library: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { play } = usePlayer()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | undefined>(undefined)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    loadPlaylists()
  }, [isAuthenticated, navigate])

  const loadPlaylists = async () => {
    try {
      setLoading(true)
      const data = await playlistService.getAll()
      setPlaylists(data)
    } catch (error) {
      console.error('Error loading playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuccess = (playlist: Playlist) => {
    loadPlaylists()
    setShowCreateModal(false)
    setEditingPlaylist(undefined)
  }

  const handleEdit = (playlist: Playlist) => {
    setEditingPlaylist(playlist)
    setShowCreateModal(true)
  }

  const handleDelete = async (playlistId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette playlist ?')) {
      return
    }

    try {
      await playlistService.delete(playlistId)
      loadPlaylists()
    } catch (error) {
      console.error('Error deleting playlist:', error)
      alert('Erreur lors de la suppression de la playlist')
    }
  }

  const handlePlayPlaylist = async (playlist: Playlist) => {
    if (!playlist.items || playlist.items.length === 0) {
      alert('Cette playlist est vide')
      return
    }

    // Jouer le premier média de la playlist
    const firstItem = playlist.items[0]
    if (firstItem.url) {
      play({
        id: firstItem.media_id,
        title: firstItem.title,
        artist: firstItem.artist,
        album: firstItem.album,
        duration: firstItem.duration,
        type: firstItem.type,
        url: firstItem.url,
        thumbnail_url: firstItem.thumbnail_url,
      })
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const containerStyle: React.CSSProperties = {
    padding: theme.spacing.xl,
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  }

  const titleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes['4xl'],
    fontWeight: 700,
    background: theme.colors.gradientPrimary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: theme.spacing.lg,
  }

  const playlistCardStyle: React.CSSProperties = {
    padding: theme.spacing.md,
    cursor: 'pointer',
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Ma Bibliothèque</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingPlaylist(undefined)
            setShowCreateModal(true)
          }}
        >
          ➕ Créer une playlist
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
          <p style={{ color: theme.colors.textSecondary }}>Chargement...</p>
        </div>
      ) : playlists.length === 0 ? (
        <div style={{ textAlign: 'center', padding: theme.spacing['2xl'] }}>
          <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.md }}>
            Vous n'avez pas encore de playlist
          </p>
          <Button
            variant="primary"
            onClick={() => {
              setEditingPlaylist(undefined)
              setShowCreateModal(true)
            }}
          >
            Créer ma première playlist
          </Button>
        </div>
      ) : (
        <div style={gridStyle}>
          {playlists.map((playlist) => (
            <Card
              key={playlist.id}
              hoverable
              style={playlistCardStyle}
              onClick={() => navigate(`/library/playlist/${playlist.id}`)}
            >
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
                  fontSize: '4rem',
                  position: 'relative',
                }}
              >
                📀
                {playlist.is_public && (
                  <div
                    style={{
                      position: 'absolute',
                      top: theme.spacing.xs,
                      right: theme.spacing.xs,
                      fontSize: theme.fontSizes.base,
                    }}
                  >
                    🌐
                  </div>
                )}
              </div>
              <h3
                style={{
                  color: theme.colors.textPrimary,
                  fontSize: theme.fontSizes.base,
                  fontWeight: 600,
                  marginBottom: theme.spacing.xs,
                }}
              >
                {playlist.name}
              </h3>
              {playlist.description && (
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
                  {playlist.description}
                </p>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: theme.spacing.sm,
                }}
              >
                <span style={{ color: theme.colors.textTertiary, fontSize: theme.fontSizes.xs }}>
                  {playlist.item_count || 0} média{playlist.item_count !== 1 ? 's' : ''}
                </span>
                <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlayPlaylist(playlist)
                    }}
                    title="Lire la playlist"
                  >
                    ▶️
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(playlist)
                    }}
                    title="Modifier"
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(playlist.id)
                    }}
                    title="Supprimer"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreatePlaylistModal
          playlist={editingPlaylist}
          onClose={() => {
            setShowCreateModal(false)
            setEditingPlaylist(undefined)
          }}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  )
}

export default Library
