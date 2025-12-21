import React, { useState } from 'react'
import { uploadService } from '../../services/upload.service'
import { Button, Input, Card } from '../ui'
import { theme } from '../../styles/theme'
import { usePlayer } from '../../contexts/PlayerContext'
import type { MediaItem } from '../../services/media.service'

interface MediaUploadFormProps {
  onUploadSuccess?: (media: MediaItem) => void
}

const MediaUploadForm: React.FC<MediaUploadFormProps> = ({ onUploadSuccess }) => {
  const [type, setType] = useState<'music' | 'video'>('music')
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [videoCategory, setVideoCategory] = useState<string>('')
  const [videoGenre, setVideoGenre] = useState<string>('')
  const [musicCategory, setMusicCategory] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [detectingDuration, setDetectingDuration] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { play } = usePlayer()

  const videoCategories = ['Cinéma', 'Série', 'Documentaire', 'Musique', 'Sport']
  const videoGenres = ['Action', 'Animation', 'Arts martiaux', 'Aventure', 'Biopic', 'Comédie', 'Comédie dramatique', 'Comédie romantique', 'Documentaire', 'Drame', 'Espionnage', 'Fantastique', 'Film musical', 'Guerre', 'Horreur', 'Paranormal', 'Policier', 'Romance', 'Science-fiction', 'Sitcom', 'Super-héros', 'Thriller', 'Thriller politique', 'Thriller psychologique', 'Western']
  const musicCategories = ['Pop', 'Rock', 'Jazz', 'Classique', 'Hip-Hop', 'Électronique', 'Rap', 'R&B', 'Country', 'Reggae', 'Metal', 'Blues', 'Folk', 'World', 'Autre']

  const detectMediaDuration = async (file: File, mediaType: 'music' | 'video') => {
    setDetectingDuration(true)
    try {
      const fileUrl = URL.createObjectURL(file)
      let detectedDuration = 0
      let timeoutId: NodeJS.Timeout | null = null

      if (mediaType === 'music') {
        // Pour les fichiers audio
        const audio = new Audio(fileUrl)
        await new Promise<void>((resolve, reject) => {
          const handleLoadedMetadata = () => {
            if (audio.duration && isFinite(audio.duration)) {
              detectedDuration = Math.floor(audio.duration)
            }
            cleanup()
            resolve()
          }

          const handleError = (e: Event) => {
            cleanup()
            reject(new Error('Erreur lors du chargement du fichier audio'))
          }

          const cleanup = () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
            audio.removeEventListener('error', handleError)
            if (timeoutId) clearTimeout(timeoutId)
            audio.src = ''
            audio.load()
          }

          audio.addEventListener('loadedmetadata', handleLoadedMetadata)
          audio.addEventListener('error', handleError)
          
          // Timeout après 5 secondes
          timeoutId = setTimeout(() => {
            if (detectedDuration === 0) {
              cleanup()
              reject(new Error('Timeout lors de la détection de la durée'))
            }
          }, 5000)

          // Forcer le chargement des métadonnées
          audio.load()
        })
      } else if (mediaType === 'video') {
        // Pour les fichiers vidéo
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.muted = true // Muter pour éviter les problèmes d'autoplay
        video.playsInline = true
        video.src = fileUrl
        
        await new Promise<void>((resolve, reject) => {
          const handleLoadedMetadata = () => {
            if (video.duration && isFinite(video.duration) && video.duration > 0) {
              detectedDuration = Math.floor(video.duration)
              console.log('Durée vidéo détectée:', detectedDuration)
            }
            cleanup()
            resolve()
          }

          const handleLoadedData = () => {
            if (video.duration && isFinite(video.duration) && video.duration > 0 && detectedDuration === 0) {
              detectedDuration = Math.floor(video.duration)
              console.log('Durée vidéo détectée (loadeddata):', detectedDuration)
            }
          }

          const handleCanPlay = () => {
            if (video.duration && isFinite(video.duration) && video.duration > 0 && detectedDuration === 0) {
              detectedDuration = Math.floor(video.duration)
              console.log('Durée vidéo détectée (canplay):', detectedDuration)
            }
          }

          const handleError = (e: Event) => {
            console.warn('Erreur lors du chargement du fichier vidéo pour détection de durée:', e)
            // Ne pas rejeter, juste résoudre sans durée détectée
            cleanup()
            resolve()
          }

          const cleanup = () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata)
            video.removeEventListener('loadeddata', handleLoadedData)
            video.removeEventListener('canplay', handleCanPlay)
            video.removeEventListener('error', handleError)
            if (timeoutId) clearTimeout(timeoutId)
            video.src = ''
            video.load()
            URL.revokeObjectURL(fileUrl)
          }

          video.addEventListener('loadedmetadata', handleLoadedMetadata)
          video.addEventListener('loadeddata', handleLoadedData)
          video.addEventListener('canplay', handleCanPlay)
          video.addEventListener('error', handleError)
          
          // Timeout après 15 secondes pour les vidéos (plus long car les vidéos peuvent être grandes)
          timeoutId = setTimeout(() => {
            if (detectedDuration === 0) {
              console.warn('Timeout lors de la détection de la durée vidéo')
              cleanup()
              resolve() // Résoudre au lieu de rejeter pour ne pas bloquer l'upload
            }
          }, 15000)

          // Forcer le chargement des métadonnées
          video.load()
        })
      }

      // Mettre à jour la durée si elle a été détectée
      if (detectedDuration > 0) {
        setDuration(detectedDuration.toString())
      }

      // Nettoyer l'URL de l'objet (déjà fait dans cleanup pour la vidéo)
      if (mediaType === 'music') {
        URL.revokeObjectURL(fileUrl)
      }
    } catch (error) {
      console.warn('Impossible de détecter automatiquement la durée du fichier:', error)
      // Ne pas bloquer l'upload si la détection échoue
      // L'utilisateur pourra entrer la durée manuellement
    } finally {
      setDetectingDuration(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      // Générer un titre par défaut si vide
      if (!title && selectedFile.name) {
        const filename = selectedFile.name.replace(/\.[^/.]+$/, '')
        setTitle(filename)
      }

      // Détecter automatiquement la durée du média
      await detectMediaDuration(selectedFile, type)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!file) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    if (type === 'music' && !artist) {
      setError('L\'artiste est requis pour les fichiers audio')
      return
    }

    if (type === 'video' && videoCategory === 'Musique' && !artist) {
      setError('L\'artiste est requis pour les vidéos musicales')
      return
    }

    setLoading(true)

    try {
      const uploadedMedia = await uploadService.uploadMedia({
        title,
        type,
        file,
        thumbnail: thumbnail || undefined,
        artist: (type === 'music' || (type === 'video' && videoCategory === 'Musique')) ? (artist || undefined) : undefined,
        album: (type === 'music' || (type === 'video' && videoCategory === 'Musique')) ? (album || undefined) : undefined,
        description: description || undefined,
        duration: duration ? parseInt(duration, 10) : undefined,
        videoCategory: type === 'video' && videoCategory ? videoCategory : undefined,
        genre: type === 'video' && ['Cinéma', 'Série'].includes(videoCategory) && videoGenre ? videoGenre : undefined,
        musicCategory: type === 'music' && musicCategory ? musicCategory : undefined,
      })

      setSuccess(true)
      
      // Convertir en MediaItem pour le player
      const mediaItem: MediaItem = {
        id: uploadedMedia.id,
        title: uploadedMedia.title,
        artist: uploadedMedia.artist,
        album: uploadedMedia.album,
        description: uploadedMedia.description,
        duration: uploadedMedia.duration,
        type: uploadedMedia.type,
        url: uploadedMedia.url,
        thumbnail_url: uploadedMedia.thumbnail_url,
      }

      // Appeler le callback si fourni
      if (onUploadSuccess) {
        onUploadSuccess(mediaItem)
      }

      // Optionnel : lancer la lecture automatiquement
      // play(mediaItem)

      // Réinitialiser le formulaire après 2 secondes
      setTimeout(() => {
        setTitle('')
        setArtist('')
        setAlbum('')
        setDescription('')
        setDuration('')
        setVideoCategory('')
        setVideoGenre('')
        setMusicCategory('')
        setFile(null)
        setThumbnail(null)
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      console.error('Upload error:', err)
      
      // Gestion détaillée des erreurs
      let errorMessage = 'Erreur lors de l\'upload du fichier'
      
      if (err.response) {
        // Erreur de réponse du serveur
        const serverMessage = err.response?.data?.message || err.response?.data?.error
        if (serverMessage) {
          errorMessage = serverMessage
        } else if (err.response.status === 401) {
          errorMessage = 'Vous devez être connecté pour uploader un fichier. Veuillez vous reconnecter.'
        } else if (err.response.status === 413) {
          errorMessage = 'Le fichier est trop volumineux. Taille maximale : 2 GB'
        } else if (err.response.status === 400) {
          errorMessage = 'Données invalides. Vérifiez que tous les champs requis sont remplis.'
        } else if (err.response.status === 500) {
          errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.'
        }
      } else if (err.request) {
        // Erreur de réseau - le serveur backend n'est probablement pas démarré
        errorMessage = 'Impossible de contacter le serveur. Assurez-vous que le serveur backend est démarré (npm run dev dans le dossier backend).'
      } else if (err.message) {
        // Erreur générée par le code
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.colors.bgSecondary,
    padding: theme.spacing['2xl'],
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.borderPrimary}`,
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

  const fileInfoStyle: React.CSSProperties = {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgTertiary,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.textSecondary,
  }

  return (
    <Card style={cardStyle}>
      <h2 style={titleStyle}>Ajouter un Média</h2>

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
          ✅ Média uploadé avec succès ! Il est maintenant disponible dans la bibliothèque.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Type selector */}
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
            Type de média
          </label>
          <div style={{ display: 'flex', gap: theme.spacing.md }}>
            <Button
              type="button"
              variant={type === 'music' ? 'primary' : 'secondary'}
              onClick={async () => {
                setType('music')
                setVideoCategory('') // Reset video category when switching to music
                setVideoGenre('') // Reset video genre when switching to music
                // Re-détecter la durée si un fichier est déjà sélectionné
                if (file) {
                  await detectMediaDuration(file, 'music')
                }
              }}
              style={{ flex: 1 }}
            >
              🎵 Musique
            </Button>
            <Button
              type="button"
              variant={type === 'video' ? 'primary' : 'secondary'}
              onClick={async () => {
                setType('video')
                setArtist('') // Reset artist/album when switching to video (unless it's a music video)
                setAlbum('')
                setVideoGenre('') // Reset video genre when switching to video
                setMusicCategory('') // Reset music category when switching to video
                // Re-détecter la durée si un fichier est déjà sélectionné
                if (file) {
                  await detectMediaDuration(file, 'video')
                }
              }}
              style={{ flex: 1 }}
            >
              🎬 Vidéo
            </Button>
          </div>
        </div>

        {/* File input */}
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
            Fichier {type === 'music' ? 'audio' : 'vidéo'} *
          </label>
          <input
            type="file"
            accept={type === 'music' ? 'audio/*' : 'video/*'}
            onChange={handleFileChange}
            style={fileInputStyle}
            required
          />
          {file && (
            <div style={fileInfoStyle}>
              📁 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        {/* Title */}
        <Input
          label="Titre *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ marginBottom: theme.spacing.lg }}
        />

        {/* Artist (for music) */}
        {type === 'music' && (
          <Input
            label="Artiste *"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
            style={{ marginBottom: theme.spacing.lg }}
          />
        )}

        {/* Album (for music) */}
        {type === 'music' && (
          <Input
            label="Album"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            style={{ marginBottom: theme.spacing.lg }}
          />
        )}

        {/* Music Category (for music) */}
        {type === 'music' && (
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
              Genre musical
            </label>
            <select
              value={musicCategory}
              onChange={(e) => setMusicCategory(e.target.value)}
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
              <option value="">Sélectionner un genre</option>
              {musicCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Video Category (for video) */}
        {type === 'video' && (
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
              onChange={(e) => {
                setVideoCategory(e.target.value)
                // Reset genre if category changes to something other than Cinéma or Série
                if (!['Cinéma', 'Série'].includes(e.target.value)) {
                  setVideoGenre('')
                }
              }}
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

        {/* Video Genre (for video with category Cinéma or Série) */}
        {type === 'video' && ['Cinéma', 'Série'].includes(videoCategory) && (
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
              Genre
            </label>
            <select
              value={videoGenre}
              onChange={(e) => setVideoGenre(e.target.value)}
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
              <option value="">Sélectionner un genre</option>
              {videoGenres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Artist (for video with category "Musique") */}
        {type === 'video' && videoCategory === 'Musique' && (
          <Input
            label="Artiste *"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
            style={{ marginBottom: theme.spacing.lg }}
          />
        )}

        {/* Album (for video with category "Musique") */}
        {type === 'video' && videoCategory === 'Musique' && (
          <Input
            label="Album"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            style={{ marginBottom: theme.spacing.lg }}
          />
        )}

        {/* Description (for video or optional for music) */}
        {type === 'video' && (
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
        <div style={{ marginBottom: theme.spacing.lg }}>
          <Input
            label="Durée (en secondes)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Ex: 180 pour 3 minutes"
            disabled={detectingDuration}
          />
          {detectingDuration && (
            <div
              style={{
                marginTop: theme.spacing.xs,
                fontSize: theme.fontSizes.sm,
                color: theme.colors.primary,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.xs,
              }}
            >
              <span>⏳</span>
              <span>Détection de la durée en cours...</span>
            </div>
          )}
          {duration && !detectingDuration && (
            <div
              style={{
                marginTop: theme.spacing.xs,
                fontSize: theme.fontSizes.sm,
                color: theme.colors.success,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.xs,
              }}
            >
              <span>✅</span>
              <span>
                Durée détectée : {Math.floor(parseInt(duration) / 60)}:{(parseInt(duration) % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

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
            {type === 'music' ? 'Pochette' : 'Miniature'} (optionnel)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            style={fileInputStyle}
          />
          {thumbnail && (
            <div style={fileInfoStyle}>
              🖼️ {thumbnail.name}
            </div>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Upload en cours...' : '📤 Uploader et Ajouter à la Bibliothèque'}
        </Button>
      </form>
    </Card>
  )
}

export default MediaUploadForm

