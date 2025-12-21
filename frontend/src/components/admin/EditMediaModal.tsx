import React, { useState, useEffect } from 'react'
import { mediaService, MediaItem } from '../../services/media.service'
import { Button, Input } from '../ui'
import { theme } from '../../styles/theme'

interface EditMediaModalProps {
  media: MediaItem | null
  onClose: () => void
  onUpdate: () => void
  onDelete?: () => void
}

const EditMediaModal: React.FC<EditMediaModalProps> = ({ media, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [videoCategory, setVideoCategory] = useState<string>('')
  const [musicCategory, setMusicCategory] = useState<string>('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const videoCategories = ['Cinéma', 'Série', 'Documentaire', 'Musique', 'Sport']
  const musicCategories = ['Pop', 'Rock', 'Jazz', 'Classique', 'Hip-Hop', 'Électronique', 'Rap', 'R&B', 'Country', 'Reggae', 'Metal', 'Blues', 'Folk', 'World', 'Autre']

  useEffect(() => {
    if (media) {
      setTitle(media.title || '')
      setArtist(media.artist || '')
      setAlbum(media.album || '')
      setDescription(media.description || '')
      setDuration(media.duration ? media.duration.toString() : '')
      setVideoCategory(media.video_category || '')
      setMusicCategory(media.music_category || '')
    }
  }, [media])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!media) return

    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      
      // Si une nouvelle miniature est uploadée, utiliser FormData
      if (thumbnail) {
        const formData = new FormData()
        formData.append('title', title)
        formData.append('duration', duration || '')
        
        if (media.type === 'music') {
          formData.append('artist', artist)
          if (album) formData.append('album', album)
        } else {
          if (description) formData.append('description', description)
          if (videoCategory) formData.append('video_category', videoCategory)
          // Si c'est une vidéo musicale, inclure artist et album
          if (videoCategory === 'Musique') {
            formData.append('artist', artist)
            if (album) formData.append('album', album)
          }
        }
        
        formData.append('thumbnail', thumbnail)
        
        const response = await fetch(`/api/media/${media.id}`, {
          method: 'PUT',
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: formData,
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Erreur lors de la mise à jour')
        }
      } else {
        // Mettre à jour le média sans nouvelle miniature
        const updateData: any = {
          title,
          duration: duration ? parseInt(duration, 10) : undefined,
        }

        if (media.type === 'music') {
          updateData.artist = artist
          updateData.album = album
          updateData.music_category = musicCategory || undefined
        } else {
          updateData.description = description
          updateData.video_category = videoCategory || undefined
          // Si c'est une vidéo musicale, inclure artist et album
          if (videoCategory === 'Musique') {
            updateData.artist = artist
            updateData.album = album
          }
        }

        await mediaService.update(media.id, updateData)
      }

      setSuccess(true)
      setTimeout(() => {
        onUpdate()
        onClose()
      }, 1000)
    } catch (err: any) {
      console.error('Update error:', err)
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du média')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!media) return

    setDeleting(true)
    setError('')

    try {
      await mediaService.delete(media.id)
      if (onDelete) {
        onDelete()
      }
      onClose()
    } catch (err: any) {
      console.error('Delete error:', err)
      setError(err.response?.data?.message || 'Erreur lors de la suppression du média')
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  if (!media) return null

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
    padding: theme.spacing.xl,
  }

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing['2xl'],
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: `1px solid ${theme.colors.borderPrimary}`,
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

  const fileInputStyle: React.CSSProperties = {
    width: '100%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgTertiary,
    border: `2px dashed ${theme.colors.borderPrimary}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.textPrimary,
    cursor: 'pointer',
    transition: theme.transitions.base,
  }

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>Modifier le Média</h2>

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

        {success && (
          <div
            style={{
              padding: theme.spacing.md,
              marginBottom: theme.spacing.md,
              backgroundColor: theme.colors.success + '20',
              border: `1px solid ${theme.colors.success}`,
              borderRadius: theme.borderRadius.md,
              color: theme.colors.success,
            }}
          >
            ✅ Média mis à jour avec succès !
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <Input
            label="Titre *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ marginBottom: theme.spacing.lg }}
          />

          {/* Artist (for music) */}
          {media.type === 'music' && (
            <Input
              label="Artiste *"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
              style={{ marginBottom: theme.spacing.lg }}
            />
          )}

          {/* Album (for music) */}
          {media.type === 'music' && (
            <Input
              label="Album"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              style={{ marginBottom: theme.spacing.lg }}
            />
          )}

          {/* Video Category (for video) */}
          {media.type === 'video' && (
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
                Type de vidéo
              </label>
              <select
                value={videoCategory}
                onChange={(e) => setVideoCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.bgSecondary,
                  border: `2px solid ${theme.colors.borderPrimary}`,
                  borderRadius: theme.borderRadius.md,
                  color: theme.colors.textPrimary,
                  fontSize: theme.fontSizes.base,
                  fontFamily: theme.fonts.primary,
                  cursor: 'pointer',
                  outline: 'none',
                  transition: theme.transitions.base,
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
                <option value="">Sélectionner un type</option>
                {videoCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Artist (for video with category "Musique") */}
          {media.type === 'video' && videoCategory === 'Musique' && (
            <Input
              label="Artiste *"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
              style={{ marginBottom: theme.spacing.lg }}
            />
          )}

          {/* Album (for video with category "Musique") */}
          {media.type === 'video' && videoCategory === 'Musique' && (
            <Input
              label="Album"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              style={{ marginBottom: theme.spacing.lg }}
            />
          )}

          {/* Description (for video) */}
          {media.type === 'video' && (
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
              />
            </div>
          )}

          {/* Duration */}
          <Input
            label="Durée (en secondes)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            style={{ marginBottom: theme.spacing.lg }}
            placeholder="Ex: 180 pour 3 minutes"
          />

          {/* Thumbnail */}
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
              {media.type === 'music' ? 'Pochette' : 'Miniature'} (optionnel)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              style={fileInputStyle}
            />
            {thumbnail && (
              <div
                style={{
                  marginTop: theme.spacing.sm,
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.bgTertiary,
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.fontSizes.sm,
                  color: theme.colors.textSecondary,
                }}
              >
                🖼️ {thumbnail.name}
              </div>
            )}
            {media.thumbnail_url && !thumbnail && (
              <div
                style={{
                  marginTop: theme.spacing.sm,
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.bgTertiary,
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.fontSizes.sm,
                  color: theme.colors.textSecondary,
                }}
              >
                Miniature actuelle : {media.thumbnail_url}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: theme.spacing.md, justifyContent: 'space-between' }}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading || deleting}
              style={{
                backgroundColor: theme.colors.error,
                color: theme.colors.textInverse,
                border: `1px solid ${theme.colors.error}`,
              }}
            >
              🗑️ Supprimer
            </Button>
            <div style={{ display: 'flex', gap: theme.spacing.md }}>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading || deleting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading || deleting}
              >
                {loading ? 'Mise à jour...' : '💾 Enregistrer les modifications'}
              </Button>
            </div>
          </div>

          {/* Confirmation de suppression */}
          {showDeleteConfirm && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: theme.zIndex.modal + 1,
              }}
              onClick={() => setShowDeleteConfirm(false)}
            >
              <div
                style={{
                  backgroundColor: theme.colors.bgSecondary,
                  borderRadius: theme.borderRadius.lg,
                  padding: theme.spacing['2xl'],
                  maxWidth: '400px',
                  width: '90%',
                  border: `1px solid ${theme.colors.borderPrimary}`,
                  boxShadow: theme.shadows.lg,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3
                  style={{
                    fontSize: theme.fontSizes.xl,
                    fontWeight: 700,
                    marginBottom: theme.spacing.lg,
                    color: theme.colors.error,
                  }}
                >
                  ⚠️ Confirmer la suppression
                </h3>
                <p
                  style={{
                    marginBottom: theme.spacing.xl,
                    color: theme.colors.textPrimary,
                    lineHeight: 1.6,
                  }}
                >
                  Êtes-vous sûr de vouloir supprimer "{media.title}" ? Cette action est irréversible.
                </p>
                <div style={{ display: 'flex', gap: theme.spacing.md, justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      backgroundColor: theme.colors.error,
                      color: theme.colors.textInverse,
                      border: `1px solid ${theme.colors.error}`,
                    }}
                  >
                    {deleting ? 'Suppression...' : '🗑️ Supprimer définitivement'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default EditMediaModal

