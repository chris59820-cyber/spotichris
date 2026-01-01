import React, { useState } from 'react'
import { playlistService, Playlist } from '../../services/playlist.service'
import { Button, Input } from '../ui'
import { theme } from '../../styles/theme'

interface CreatePlaylistModalProps {
  onClose: () => void
  onSuccess: (playlist: Playlist) => void
  playlist?: Playlist // Pour l'édition
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ onClose, onSuccess, playlist }) => {
  const [name, setName] = useState(playlist?.name || '')
  const [description, setDescription] = useState(playlist?.description || '')
  const [isPublic, setIsPublic] = useState(playlist?.is_public || false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Le nom de la playlist est requis')
      return
    }

    setLoading(true)
    try {
      let result: Playlist
      if (playlist) {
        result = await playlistService.update(playlist.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          is_public: isPublic,
        })
      } else {
        result = await playlistService.create({
          name: name.trim(),
          description: description.trim() || undefined,
          is_public: isPublic,
        })
      }
      onSuccess(result)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la playlist')
    } finally {
      setLoading(false)
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

        <h2 style={titleStyle}>{playlist ? 'Modifier la playlist' : 'Créer une playlist'}</h2>

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

        <form onSubmit={handleSubmit}>
          <Input
            label="Nom de la playlist *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ marginBottom: theme.spacing.lg }}
            placeholder="Ma super playlist"
          />

          <div style={{ marginBottom: theme.spacing.lg }}>
            <label
              style={{
                display: 'block',
                marginBottom: theme.spacing.sm,
                color: theme.colors.textSecondary,
                fontSize: theme.fontSizes.sm,
                fontWeight: 500,
              }}
            >
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: theme.spacing.md,
                backgroundColor: theme.colors.bgSecondary,
                border: `2px solid ${theme.colors.borderPrimary}`,
                borderRadius: theme.borderRadius.md,
                color: theme.colors.textPrimary,
                fontSize: theme.fontSizes.base,
                fontFamily: theme.fonts.primary,
                resize: 'vertical',
              }}
              placeholder="Décrivez votre playlist..."
            />
          </div>

          <div style={{ marginBottom: theme.spacing.xl }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                }}
              />
              <span style={{ color: theme.colors.textPrimary }}>
                Rendre cette playlist publique
              </span>
            </label>
          </div>

          <div style={{ display: 'flex', gap: theme.spacing.md, justifyContent: 'flex-end' }}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Enregistrement...' : playlist ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePlaylistModal






