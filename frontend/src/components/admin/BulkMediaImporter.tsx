import React, { useState, useRef } from 'react'
import { theme } from '../../styles/theme'
import { Button, Modal } from '../ui'
import axios from 'axios'

interface BulkMediaImporterProps {
  isOpen: boolean
  onClose: () => void
  onImportSuccess: () => void
}

interface LocalMediaFile {
  id: string // Identifiant unique basé sur le nom du fichier
  file: File
  title: string
  artist?: string
  album?: string
  type: 'music' | 'video'
  duration?: number
  thumbnail?: File | null
  description?: string
  genre?: string
  music_category?: string
  video_category?: string
}

const BulkMediaImporter: React.FC<BulkMediaImporterProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [localMediaFiles, setLocalMediaFiles] = useState<LocalMediaFile[]>([])
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set())
  const [processing, setProcessing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'music' | 'video'>('all')
  const [showBulkEdit, setShowBulkEdit] = useState(false)
  const [bulkArtist, setBulkArtist] = useState('')
  const [bulkAlbum, setBulkAlbum] = useState('')
  const [bulkGenre, setBulkGenre] = useState('')
  const [bulkMusicCategory, setBulkMusicCategory] = useState('')
  const [bulkVideoCategory, setBulkVideoCategory] = useState('')
  const [bulkThumbnail, setBulkThumbnail] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const videoCategories = ['Cinéma', 'Série', 'Documentaire', 'Musique', 'Sport']
  const videoGenres = ['Action', 'Animation', 'Arts martiaux', 'Aventure', 'Biopic', 'Comédie', 'Comédie dramatique', 'Comédie romantique', 'Documentaire', 'Drame', 'Espionnage', 'Fantastique', 'Film musical', 'Guerre', 'Horreur', 'Paranormal', 'Policier', 'Romance', 'Science-fiction', 'Sitcom', 'Super-héros', 'Thriller', 'Thriller politique', 'Thriller psychologique', 'Western']
  const musicCategories = ['Pop', 'Rock', 'Jazz', 'Classique', 'Hip-Hop', 'Électronique', 'Rap', 'R&B', 'Country', 'Reggae', 'Metal', 'Blues', 'Folk', 'World', 'Autre']

  const detectMediaType = (file: File): 'music' | 'video' => {
    const mimeType = file.type
    if (mimeType.startsWith('audio/')) return 'music'
    if (mimeType.startsWith('video/')) return 'video'
    
    // Fallback basé sur l'extension
    const extension = file.name.split('.').pop()?.toLowerCase()
    const audioExtensions = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma']
    const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv']
    
    if (extension && audioExtensions.includes(extension)) return 'music'
    if (extension && videoExtensions.includes(extension)) return 'video'
    
    return 'music' // Par défaut
  }

  const extractMetadataFromFileName = (fileName: string): { title: string; artist?: string; album?: string } => {
    // Formats courants : "Artiste - Titre.mp3", "Artiste - Album - Titre.mp3", etc.
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
    const parts = nameWithoutExt.split(' - ')
    
    if (parts.length >= 2) {
      return {
        artist: parts[0].trim(),
        title: parts.slice(1).join(' - ').trim(),
      }
    }
    
    return {
      title: nameWithoutExt.trim(),
    }
  }

  const detectDuration = async (file: File, type: 'music' | 'video'): Promise<number | undefined> => {
    return new Promise((resolve) => {
      const fileUrl = URL.createObjectURL(file)
      let detectedDuration = 0
      let timeoutId: NodeJS.Timeout | null = null

      if (type === 'music') {
        const audio = new Audio(fileUrl)
        const handleLoadedMetadata = () => {
          if (audio.duration && isFinite(audio.duration)) {
            detectedDuration = Math.floor(audio.duration)
          }
          cleanup()
          resolve(detectedDuration || undefined)
        }

        const handleError = () => {
          cleanup()
          resolve(undefined)
        }

        const cleanup = () => {
          audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
          audio.removeEventListener('error', handleError)
          if (timeoutId) clearTimeout(timeoutId)
          URL.revokeObjectURL(fileUrl)
        }

        audio.addEventListener('loadedmetadata', handleLoadedMetadata)
        audio.addEventListener('error', handleError)
        
        timeoutId = setTimeout(() => {
          cleanup()
          resolve(undefined)
        }, 5000)

        audio.load()
      } else {
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.muted = true
        video.src = fileUrl

        const handleLoadedMetadata = () => {
          if (video.duration && isFinite(video.duration)) {
            detectedDuration = Math.floor(video.duration)
          }
          cleanup()
          resolve(detectedDuration || undefined)
        }

        const handleError = () => {
          cleanup()
          resolve(undefined)
        }

        const cleanup = () => {
          video.removeEventListener('loadedmetadata', handleLoadedMetadata)
          video.removeEventListener('error', handleError)
          if (timeoutId) clearTimeout(timeoutId)
          URL.revokeObjectURL(fileUrl)
        }

        video.addEventListener('loadedmetadata', handleLoadedMetadata)
        video.addEventListener('error', handleError)
        
        timeoutId = setTimeout(() => {
          cleanup()
          resolve(undefined)
        }, 10000)

        video.load()
      }
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setProcessing(true)
    setError(null)
    const newMediaFiles: LocalMediaFile[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const type = detectMediaType(file)
        
        // Ignorer les fichiers qui ne sont pas des médias
        if (type === 'music' && !file.type.startsWith('audio/') && !['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma'].includes(file.name.split('.').pop()?.toLowerCase() || '')) {
          continue
        }
        if (type === 'video' && !file.type.startsWith('video/') && !['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(file.name.split('.').pop()?.toLowerCase() || '')) {
          continue
        }

        const metadata = extractMetadataFromFileName(file.name)
        const duration = await detectDuration(file, type)

        const mediaFile: LocalMediaFile = {
          id: `${file.name}-${i}`,
          file,
          title: metadata.title || file.name,
          artist: metadata.artist,
          album: metadata.album,
          type,
          duration,
        }

        newMediaFiles.push(mediaFile)
      }

      setLocalMediaFiles(newMediaFiles)
      // Sélectionner tous les fichiers par défaut
      setSelectedMedia(new Set(newMediaFiles.map((m) => m.id)))
    } catch (err: any) {
      console.error('Error processing files:', err)
      setError('Erreur lors du traitement des fichiers')
    } finally {
      setProcessing(false)
    }
  }

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedMedia)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedMedia(newSelected)
  }

  const handleSelectAll = () => {
    const filtered = getFilteredMedia()
    if (selectedMedia.size === filtered.length && filtered.length > 0) {
      setSelectedMedia(new Set())
    } else {
      setSelectedMedia(new Set(filtered.map((m) => m.id)))
    }
  }

  const handleUpdateMedia = (id: string, updates: Partial<LocalMediaFile>) => {
    setLocalMediaFiles((prev) =>
      prev.map((media) => (media.id === id ? { ...media, ...updates } : media))
    )
  }

  const handleApplyBulkEdit = () => {
    if (selectedMedia.size === 0) {
      setError('Veuillez sélectionner au moins un média')
      return
    }

    const updates: Partial<LocalMediaFile> = {}
    if (bulkArtist) updates.artist = bulkArtist
    if (bulkAlbum) updates.album = bulkAlbum
    if (bulkGenre) updates.genre = bulkGenre
    if (bulkMusicCategory) updates.music_category = bulkMusicCategory
    if (bulkVideoCategory) updates.video_category = bulkVideoCategory
    if (bulkThumbnail) updates.thumbnail = bulkThumbnail

    selectedMedia.forEach((id) => {
      handleUpdateMedia(id, updates)
    })

    // Réinitialiser les champs de saisie en masse
    setBulkArtist('')
    setBulkAlbum('')
    setBulkGenre('')
    setBulkMusicCategory('')
    setBulkVideoCategory('')
    setBulkThumbnail(null)
    setShowBulkEdit(false)
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ''
    }
  }

  const handleImport = async () => {
    if (selectedMedia.size === 0) {
      setError('Veuillez sélectionner au moins un média')
      return
    }

    setImporting(true)
    setError(null)

    try {
      const selectedItems = localMediaFiles.filter((m) => selectedMedia.has(m.id))
      const results = []

      for (const item of selectedItems) {
        try {
          const formData = new FormData()
          formData.append('title', item.title)
          formData.append('type', item.type)
          formData.append('file', item.file)
          
          if (item.artist) formData.append('artist', item.artist)
          if (item.album) formData.append('album', item.album)
          if (item.duration) formData.append('duration', item.duration.toString())
          if (item.description) formData.append('description', item.description)
          if (item.genre) formData.append('genre', item.genre)
          if (item.music_category) formData.append('music_category', item.music_category)
          if (item.video_category) formData.append('video_category', item.video_category)
          if (item.thumbnail) formData.append('thumbnail', item.thumbnail)

          const token = localStorage.getItem('token')
          await axios.post('/api/media', formData, {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
              'Content-Type': 'multipart/form-data',
            },
          })

          results.push({ success: true, title: item.title })
        } catch (err: any) {
          console.error(`Error importing media ${item.id}:`, err)
          results.push({
            success: false,
            title: item.title,
            error: err.response?.data?.message || err.message,
          })
        }
      }

      const successCount = results.filter((r) => r.success).length
      const errorCount = results.filter((r) => !r.success).length

      if (errorCount > 0) {
        setError(
          `${successCount} média${successCount > 1 ? 'x' : ''} importé${successCount > 1 ? 's' : ''}, ${errorCount} erreur${errorCount > 1 ? 's' : ''}`
        )
      } else {
        setLocalMediaFiles([])
        setSelectedMedia(new Set())
        onImportSuccess()
        onClose()
      }
    } catch (err: any) {
      console.error('Error importing media:', err)
      setError(err.response?.data?.message || 'Erreur lors de l\'importation des médias')
    } finally {
      setImporting(false)
    }
  }

  const getFilteredMedia = () => {
    let filtered = localMediaFiles

    if (filterType !== 'all') {
      filtered = filtered.filter((m) => m.type === filterType)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(term) ||
          m.artist?.toLowerCase().includes(term) ||
          m.album?.toLowerCase().includes(term)
      )
    }

    return filtered
  }

  const filteredMedia = getFilteredMedia()

  const handleClose = () => {
    setLocalMediaFiles([])
    setSelectedMedia(new Set())
    setError(null)
    setSearchTerm('')
    setFilterType('all')
    setShowBulkEdit(false)
    setBulkArtist('')
    setBulkAlbum('')
    setBulkGenre('')
    setBulkMusicCategory('')
    setBulkVideoCategory('')
    setBulkThumbnail(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ''
    }
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importer des médias depuis un dossier local" size="xl">
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        {/* Sélection de fichiers */}
        <div
          style={{
            padding: theme.spacing.lg,
            border: `2px dashed ${theme.colors.borderPrimary}`,
            borderRadius: theme.borderRadius.md,
            textAlign: 'center',
            backgroundColor: theme.colors.bgSecondary,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,video/*,.mp3,.wav,.flac,.aac,.ogg,.m4a,.wma,.mp4,.webm,.avi,.mov,.wmv,.flv,.mkv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing || importing}
            style={{ marginBottom: theme.spacing.sm }}
          >
            {processing ? 'Traitement...' : '📁 Sélectionner des fichiers depuis un dossier'}
          </Button>
          <p style={{ fontSize: theme.fontSizes.sm, color: theme.colors.textSecondary, margin: 0 }}>
            Sélectionnez plusieurs fichiers audio ou vidéo à la fois depuis votre ordinateur
          </p>
        </div>

        {/* Filtres et recherche */}
        {localMediaFiles.length > 0 && (
          <>
            <div style={{ display: 'flex', gap: theme.spacing.md, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.borderPrimary}`,
                  backgroundColor: theme.colors.bgSecondary,
                  color: theme.colors.textPrimary,
                  fontSize: theme.fontSizes.base,
                }}
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'music' | 'video')}
                style={{
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.borderPrimary}`,
                  backgroundColor: theme.colors.bgSecondary,
                  color: theme.colors.textPrimary,
                  fontSize: theme.fontSizes.base,
                }}
              >
                <option value="all">Tous les types</option>
                <option value="music">Musique</option>
                <option value="video">Vidéo</option>
              </select>
              <Button variant="secondary" size="sm" onClick={handleSelectAll} style={{ whiteSpace: 'nowrap' }}>
                {selectedMedia.size === filteredMedia.length && filteredMedia.length > 0
                  ? 'Tout désélectionner'
                  : 'Tout sélectionner'}
              </Button>
              {selectedMedia.size > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowBulkEdit(!showBulkEdit)}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {showBulkEdit ? '✕ Masquer' : '✏️ Modifier en masse'}
                </Button>
              )}
            </div>

            {/* Zone de saisie en masse */}
            {showBulkEdit && selectedMedia.size > 0 && (
              <div
                style={{
                  padding: theme.spacing.lg,
                  backgroundColor: theme.colors.bgTertiary,
                  border: `2px solid ${theme.colors.primary}`,
                  borderRadius: theme.borderRadius.md,
                }}
              >
                <div
                  style={{
                    fontSize: theme.fontSizes.lg,
                    fontWeight: 600,
                    color: theme.colors.textPrimary,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  Modification en masse ({selectedMedia.size} média{selectedMedia.size > 1 ? 'x' : ''} sélectionné{selectedMedia.size > 1 ? 's' : ''})
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: theme.spacing.md,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: theme.fontSizes.sm,
                        color: theme.colors.textSecondary,
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      Artiste
                    </label>
                    <input
                      type="text"
                      value={bulkArtist}
                      onChange={(e) => setBulkArtist(e.target.value)}
                      placeholder="Nom de l'artiste"
                      style={{
                        width: '100%',
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius.md,
                        border: `1px solid ${theme.colors.borderPrimary}`,
                        backgroundColor: theme.colors.bgSecondary,
                        color: theme.colors.textPrimary,
                        fontSize: theme.fontSizes.base,
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: theme.fontSizes.sm,
                        color: theme.colors.textSecondary,
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      Album
                    </label>
                    <input
                      type="text"
                      value={bulkAlbum}
                      onChange={(e) => setBulkAlbum(e.target.value)}
                      placeholder="Nom de l'album"
                      style={{
                        width: '100%',
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius.md,
                        border: `1px solid ${theme.colors.borderPrimary}`,
                        backgroundColor: theme.colors.bgSecondary,
                        color: theme.colors.textPrimary,
                        fontSize: theme.fontSizes.base,
                      }}
                    />
                  </div>
                  {filteredMedia.some((m) => m.type === 'music') && (
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: theme.fontSizes.sm,
                          color: theme.colors.textSecondary,
                          marginBottom: theme.spacing.xs,
                        }}
                      >
                        Catégorie Musique
                      </label>
                      <select
                        value={bulkMusicCategory}
                        onChange={(e) => setBulkMusicCategory(e.target.value)}
                        style={{
                          width: '100%',
                          padding: theme.spacing.sm,
                          borderRadius: theme.borderRadius.md,
                          border: `1px solid ${theme.colors.borderPrimary}`,
                          backgroundColor: theme.colors.bgSecondary,
                          color: theme.colors.textPrimary,
                          fontSize: theme.fontSizes.base,
                        }}
                      >
                        <option value="">Aucune</option>
                        {musicCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {filteredMedia.some((m) => m.type === 'video') && (
                    <>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            fontSize: theme.fontSizes.sm,
                            color: theme.colors.textSecondary,
                            marginBottom: theme.spacing.xs,
                          }}
                        >
                          Catégorie Vidéo
                        </label>
                        <select
                          value={bulkVideoCategory}
                          onChange={(e) => setBulkVideoCategory(e.target.value)}
                          style={{
                            width: '100%',
                            padding: theme.spacing.sm,
                            borderRadius: theme.borderRadius.md,
                            border: `1px solid ${theme.colors.borderPrimary}`,
                            backgroundColor: theme.colors.bgSecondary,
                            color: theme.colors.textPrimary,
                            fontSize: theme.fontSizes.base,
                          }}
                        >
                          <option value="">Aucune</option>
                          {videoCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      {bulkVideoCategory && ['Cinéma', 'Série'].includes(bulkVideoCategory) && (
                        <div>
                          <label
                            style={{
                              display: 'block',
                              fontSize: theme.fontSizes.sm,
                              color: theme.colors.textSecondary,
                              marginBottom: theme.spacing.xs,
                            }}
                          >
                            Genre
                          </label>
                          <select
                            value={bulkGenre}
                            onChange={(e) => setBulkGenre(e.target.value)}
                            style={{
                              width: '100%',
                              padding: theme.spacing.sm,
                              borderRadius: theme.borderRadius.md,
                              border: `1px solid ${theme.colors.borderPrimary}`,
                              backgroundColor: theme.colors.bgSecondary,
                              color: theme.colors.textPrimary,
                              fontSize: theme.fontSizes.base,
                            }}
                          >
                            <option value="">Aucun</option>
                            {videoGenres.map((genre) => (
                              <option key={genre} value={genre}>
                                {genre}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: theme.fontSizes.sm,
                        color: theme.colors.textSecondary,
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      Miniature (image)
                    </label>
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        setBulkThumbnail(file || null)
                      }}
                      style={{
                        width: '100%',
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius.md,
                        border: `1px solid ${theme.colors.borderPrimary}`,
                        backgroundColor: theme.colors.bgSecondary,
                        color: theme.colors.textPrimary,
                        fontSize: theme.fontSizes.sm,
                        cursor: 'pointer',
                      }}
                    />
                    {bulkThumbnail && (
                      <div
                        style={{
                          marginTop: theme.spacing.xs,
                          fontSize: theme.fontSizes.xs,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {bulkThumbnail.name}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: theme.spacing.md, justifyContent: 'flex-end' }}>
                  <Button variant="secondary" size="sm" onClick={() => setShowBulkEdit(false)}>
                    Annuler
                  </Button>
                  <Button variant="primary" size="sm" onClick={handleApplyBulkEdit}>
                    Appliquer à {selectedMedia.size} média{selectedMedia.size > 1 ? 'x' : ''}
                  </Button>
                </div>
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <div
                style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.error + '20',
                  border: `1px solid ${theme.colors.error}`,
                  borderRadius: theme.borderRadius.md,
                  color: theme.colors.error,
                }}
              >
                {error}
              </div>
            )}

            {/* Liste des médias */}
            <div
              style={{
                maxHeight: '60vh',
                overflowY: 'auto',
                border: `1px solid ${theme.colors.borderPrimary}`,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
              }}
            >
              {filteredMedia.length === 0 ? (
                <div style={{ textAlign: 'center', padding: theme.spacing['2xl'], color: theme.colors.textSecondary }}>
                  {searchTerm || filterType !== 'all'
                    ? 'Aucun média ne correspond à votre recherche'
                    : 'Aucun média chargé'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                  {filteredMedia.map((media) => (
                    <div
                      key={media.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: theme.spacing.sm,
                        padding: theme.spacing.md,
                        backgroundColor: selectedMedia.has(media.id)
                          ? theme.colors.primary + '20'
                          : theme.colors.bgSecondary,
                        border: `1px solid ${
                          selectedMedia.has(media.id) ? theme.colors.primary : theme.colors.borderPrimary
                        }`,
                        borderRadius: theme.borderRadius.md,
                        transition: theme.transitions.base,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                        <input
                          type="checkbox"
                          checked={selectedMedia.has(media.id)}
                          onChange={() => handleToggleSelect(media.id)}
                          style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <input
                            type="text"
                            value={media.title}
                            onChange={(e) => handleUpdateMedia(media.id, { title: e.target.value })}
                            placeholder="Titre"
                            style={{
                              width: '100%',
                              padding: theme.spacing.xs,
                              borderRadius: theme.borderRadius.sm,
                              border: `1px solid ${theme.colors.borderPrimary}`,
                              backgroundColor: theme.colors.bgPrimary,
                              color: theme.colors.textPrimary,
                              fontSize: theme.fontSizes.base,
                              fontWeight: 600,
                              marginBottom: theme.spacing.xs / 2,
                            }}
                          />
                          <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                            <input
                              type="text"
                              value={media.artist || ''}
                              onChange={(e) => handleUpdateMedia(media.id, { artist: e.target.value })}
                              placeholder="Artiste"
                              style={{
                                flex: 1,
                                minWidth: '150px',
                                padding: theme.spacing.xs,
                                borderRadius: theme.borderRadius.sm,
                                border: `1px solid ${theme.colors.borderPrimary}`,
                                backgroundColor: theme.colors.bgPrimary,
                                color: theme.colors.textPrimary,
                                fontSize: theme.fontSizes.sm,
                              }}
                            />
                            <input
                              type="text"
                              value={media.album || ''}
                              onChange={(e) => handleUpdateMedia(media.id, { album: e.target.value })}
                              placeholder="Album"
                              style={{
                                flex: 1,
                                minWidth: '150px',
                                padding: theme.spacing.xs,
                                borderRadius: theme.borderRadius.sm,
                                border: `1px solid ${theme.colors.borderPrimary}`,
                                backgroundColor: theme.colors.bgPrimary,
                                color: theme.colors.textPrimary,
                                fontSize: theme.fontSizes.sm,
                              }}
                            />
                          </div>
                          {media.type === 'video' && (
                            <div style={{ display: 'flex', gap: theme.spacing.sm, marginTop: theme.spacing.xs }}>
                              <select
                                value={media.video_category || ''}
                                onChange={(e) => handleUpdateMedia(media.id, { video_category: e.target.value })}
                                style={{
                                  flex: 1,
                                  padding: theme.spacing.xs,
                                  borderRadius: theme.borderRadius.sm,
                                  border: `1px solid ${theme.colors.borderPrimary}`,
                                  backgroundColor: theme.colors.bgPrimary,
                                  color: theme.colors.textPrimary,
                                  fontSize: theme.fontSizes.sm,
                                }}
                              >
                                <option value="">Catégorie vidéo</option>
                                {videoCategories.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                              {['Cinéma', 'Série'].includes(media.video_category || '') && (
                                <select
                                  value={media.genre || ''}
                                  onChange={(e) => handleUpdateMedia(media.id, { genre: e.target.value })}
                                  style={{
                                    flex: 1,
                                    padding: theme.spacing.xs,
                                    borderRadius: theme.borderRadius.sm,
                                    border: `1px solid ${theme.colors.borderPrimary}`,
                                    backgroundColor: theme.colors.bgPrimary,
                                    color: theme.colors.textPrimary,
                                    fontSize: theme.fontSizes.sm,
                                  }}
                                >
                                  <option value="">Genre</option>
                                  {videoGenres.map((genre) => (
                                    <option key={genre} value={genre}>
                                      {genre}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          )}
                          {media.type === 'music' && (
                            <select
                              value={media.music_category || ''}
                              onChange={(e) => handleUpdateMedia(media.id, { music_category: e.target.value })}
                              style={{
                                width: '100%',
                                marginTop: theme.spacing.xs,
                                padding: theme.spacing.xs,
                                borderRadius: theme.borderRadius.sm,
                                border: `1px solid ${theme.colors.borderPrimary}`,
                                backgroundColor: theme.colors.bgPrimary,
                                color: theme.colors.textPrimary,
                                fontSize: theme.fontSizes.sm,
                              }}
                            >
                              <option value="">Catégorie musique</option>
                              {musicCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          )}
                          <div
                            style={{
                              fontSize: theme.fontSizes.xs,
                              color: theme.colors.textTertiary,
                              marginTop: theme.spacing.xs,
                              display: 'flex',
                              gap: theme.spacing.sm,
                              alignItems: 'center',
                            }}
                          >
                            <span>{media.type === 'music' ? '🎵' : '🎬'}</span>
                            <span>{media.file.name}</span>
                            <span>•</span>
                            <span>{(media.file.size / 1024 / 1024).toFixed(2)} MB</span>
                            {media.duration && (
                              <>
                                <span>•</span>
                                <span>
                                  {Math.floor(media.duration / 60)}:
                                  {Math.floor(media.duration % 60)
                                    .toString()
                                    .padStart(2, '0')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm }}>
                {selectedMedia.size} média{selectedMedia.size > 1 ? 'x' : ''} sélectionné{selectedMedia.size > 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', gap: theme.spacing.md }}>
                <Button variant="secondary" onClick={handleClose} disabled={importing}>
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleImport}
                  disabled={importing || selectedMedia.size === 0}
                >
                  {importing
                    ? 'Importation...'
                    : `Importer ${selectedMedia.size} média${selectedMedia.size > 1 ? 'x' : ''}`}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default BulkMediaImporter
