import { Request, Response } from 'express'
import multer from 'multer'
import { MediaService } from '../services/media.service'
import { ValidationError } from '../utils/errors'

const mediaService = new MediaService()

export const getAllMedia = async (req: Request, res: Response) => {
  try {
    const { type, limit, offset, artist, music_category, video_category } = req.query

    // Validate type if provided
    if (type && type !== 'music' && type !== 'video') {
      throw new ValidationError('Type must be "music" or "video"')
    }

    const params = {
      type: type as 'music' | 'video' | undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      offset: offset ? parseInt(offset as string, 10) : undefined,
      artist: artist as string | undefined,
      music_category: music_category as string | undefined,
      video_category: video_category as string | undefined,
    }

    // Validate limit and offset
    if (params.limit !== undefined && (isNaN(params.limit) || params.limit < 1 || params.limit > 100)) {
      throw new ValidationError('Limit must be between 1 and 100')
    }

    if (params.offset !== undefined && (isNaN(params.offset) || params.offset < 0)) {
      throw new ValidationError('Offset must be a positive number')
    }

    const result = await mediaService.getAll(params)
    res.json(result)
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error fetching media:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getMediaById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)

    if (isNaN(id)) {
      throw new ValidationError('Invalid media ID')
    }

    const media = await mediaService.getById(id)
    res.json(media)
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error fetching media by id:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const updateMedia = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)

    if (isNaN(id)) {
      throw new ValidationError('Invalid media ID')
    }

    const { title, description, artist, album, duration, thumbnail_url, video_category, genre, music_category } = req.body
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined
    const thumbnailFile = files?.thumbnail?.[0]

    // Validate video category if provided
    if (video_category) {
      const validCategories = ['Cinéma', 'Série', 'Documentaire', 'Musique', 'Sport']
      if (!validCategories.includes(video_category)) {
        throw new ValidationError(`Invalid video category. Must be one of: ${validCategories.join(', ')}`)
      }
    }

    // Validate genre if provided (only for Cinéma and Série)
    if (genre) {
      const validGenres = ['Action', 'Animation', 'Arts martiaux', 'Aventure', 'Biopic', 'Comédie', 'Comédie dramatique', 'Comédie romantique', 'Documentaire', 'Drame', 'Espionnage', 'Fantastique', 'Film musical', 'Guerre', 'Horreur', 'Paranormal', 'Policier', 'Romance', 'Science-fiction', 'Sitcom', 'Super-héros', 'Thriller', 'Thriller politique', 'Thriller psychologique', 'Western']
      if (!validGenres.includes(genre)) {
        throw new ValidationError(`Invalid genre. Must be one of: ${validGenres.join(', ')}`)
      }
      // Genre is only valid for Cinéma and Série
      if (video_category && !['Cinéma', 'Série'].includes(video_category)) {
        throw new ValidationError('Genre can only be set for Cinéma or Série video categories')
      }
    }

    // Validate music category if provided
    if (music_category) {
      const validCategories = ['Pop', 'Rock', 'Jazz', 'Classique', 'Hip-Hop', 'Électronique', 'Rap', 'R&B', 'Country', 'Reggae', 'Metal', 'Blues', 'Folk', 'World', 'Autre']
      if (!validCategories.includes(music_category)) {
        throw new ValidationError(`Invalid music category. Must be one of: ${validCategories.join(', ')}`)
      }
    }

    // Handle thumbnail upload if provided
    let finalThumbnailUrl: string | undefined = thumbnail_url
    if (thumbnailFile) {
      const { getPublicUrl } = await import('../config/upload')
      finalThumbnailUrl = getPublicUrl(thumbnailFile.filename, 'thumbnail')
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (artist !== undefined) updateData.artist = artist
    if (album !== undefined) updateData.album = album
    if (duration !== undefined) updateData.duration = duration ? parseInt(duration, 10) : null
    if (finalThumbnailUrl !== undefined) updateData.thumbnail_url = finalThumbnailUrl
    if (video_category !== undefined) updateData.video_category = video_category || null
    if (genre !== undefined) {
      // Only set genre if video_category is Cinéma or Série
      if (video_category && ['Cinéma', 'Série'].includes(video_category)) {
        updateData.genre = genre || null
      } else if (!video_category) {
        // If video_category is not provided, check existing media
        const existingMedia = await mediaService.getById(id)
        if (existingMedia && existingMedia.video_category && ['Cinéma', 'Série'].includes(existingMedia.video_category)) {
          updateData.genre = genre || null
        } else {
          updateData.genre = null
        }
      } else {
        updateData.genre = null
      }
    }
    if (music_category !== undefined) updateData.music_category = music_category || null

    const media = await mediaService.update(id, updateData)
    res.json(media)
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error updating media:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const createMedia = async (req: Request, res: Response) => {
  try {
    // Multer adds files to req.files (using fields) and body fields to req.body
    const { title, description, artist, album, duration, type, thumbnail_url, video_category, genre, music_category } = req.body
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined
    const file = files?.file?.[0] // The uploaded media file
    const thumbnailFile = files?.thumbnail?.[0] // The uploaded thumbnail file

    // Validation
    if (!title || !type) {
      throw new ValidationError('Title and type are required')
    }

    if (type !== 'music' && type !== 'video') {
      throw new ValidationError('Type must be "music" or "video"')
    }

    if (type === 'music' && !artist) {
      throw new ValidationError('Artist is required for music media')
    }

    if (type === 'video' && video_category === 'Musique' && !artist) {
      throw new ValidationError('Artist is required for music videos')
    }

    // Validate video category if provided
    if (type === 'video' && video_category) {
      const validCategories = ['Cinéma', 'Série', 'Documentaire', 'Musique', 'Sport']
      if (!validCategories.includes(video_category)) {
        throw new ValidationError(`Invalid video category. Must be one of: ${validCategories.join(', ')}`)
      }
    }

    // Validate genre if provided (only for Cinéma and Série)
    if (type === 'video' && genre) {
      const validGenres = ['Action', 'Animation', 'Arts martiaux', 'Aventure', 'Biopic', 'Comédie', 'Comédie dramatique', 'Comédie romantique', 'Documentaire', 'Drame', 'Espionnage', 'Fantastique', 'Film musical', 'Guerre', 'Horreur', 'Paranormal', 'Policier', 'Romance', 'Science-fiction', 'Sitcom', 'Super-héros', 'Thriller', 'Thriller politique', 'Thriller psychologique', 'Western']
      if (!validGenres.includes(genre)) {
        throw new ValidationError(`Invalid genre. Must be one of: ${validGenres.join(', ')}`)
      }
      // Genre is only valid for Cinéma and Série
      if (video_category && !['Cinéma', 'Série'].includes(video_category)) {
        throw new ValidationError('Genre can only be set for Cinéma or Série video categories')
      }
    }

    // Validate music category if provided
    if (type === 'music' && music_category) {
      const validCategories = ['Pop', 'Rock', 'Jazz', 'Classique', 'Hip-Hop', 'Électronique', 'Rap', 'R&B', 'Country', 'Reggae', 'Metal', 'Blues', 'Folk', 'World', 'Autre']
      if (!validCategories.includes(music_category)) {
        throw new ValidationError(`Invalid music category. Must be one of: ${validCategories.join(', ')}`)
      }
    }

    // Si des fichiers ont été uploadés, utiliser leurs URLs
    let finalUrl: string | undefined = undefined
    let finalThumbnailUrl: string | undefined = thumbnail_url

    if (file) {
      const { getPublicUrl } = await import('../config/upload')
      finalUrl = getPublicUrl(file.filename, type as 'music' | 'video')
    } else if (req.body.url) {
      // Allow external URL if no file is uploaded
      finalUrl = req.body.url
    } else {
      throw new ValidationError('Media URL or an uploaded file is required')
    }

    if (thumbnailFile) {
      const { getPublicUrl } = await import('../config/upload')
      finalThumbnailUrl = getPublicUrl(thumbnailFile.filename, 'thumbnail')
    }

    const mediaData = {
      title,
      description,
      artist,
      album,
      duration: duration ? parseInt(duration, 10) : undefined,
      type: type as 'music' | 'video',
      url: finalUrl,
      thumbnail_url: finalThumbnailUrl,
      video_category: type === 'video' ? (video_category || undefined) : undefined,
      genre: type === 'video' && ['Cinéma', 'Série'].includes(video_category || '') ? (genre || undefined) : undefined,
      music_category: type === 'music' ? (music_category || undefined) : undefined,
    }

    const media = await mediaService.create(mediaData)
    res.status(201).json(media)
  } catch (error: any) {
    console.error('Error creating media:', error)
    
    // Gestion spécifique des erreurs Multer
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ 
          message: 'Le fichier est trop volumineux. Taille maximale : 500 MB' 
        })
      }
      return res.status(400).json({ 
        message: `Erreur d'upload: ${error.message}` 
      })
    }
    
    // Gestion des erreurs de validation de fichier
    if (error.message && (error.message.includes('Type de fichier non supporté') || error.message.includes('Type d\'image non supporté'))) {
      return res.status(400).json({ 
        message: error.message 
      })
    }
    
    // Gestion des erreurs de validation
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    
    // Erreur générique
    res.status(500).json({ 
      message: error.message || 'Erreur serveur lors de la création du média' 
    })
  }
}

export const deleteMedia = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10)

    if (isNaN(id)) {
      throw new ValidationError('Invalid media ID')
    }

    // Récupérer le média avant suppression pour obtenir les chemins des fichiers
    const media = await mediaService.getById(id)
    
    // Supprimer le média de la base de données
    await mediaService.delete(id)

    // Optionnel : supprimer les fichiers uploadés du système de fichiers
    if (media.url) {
      try {
        const fs = await import('fs')
        const path = await import('path')
        const { fileURLToPath } = await import('url')
        
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)
        
        // Extraire le nom du fichier de l'URL
        const urlParts = media.url.split('/')
        const filename = urlParts[urlParts.length - 1]
        
        // Déterminer le dossier selon le type
        const folder = media.type === 'music' ? 'music' : 'video'
        const filePath = path.join(__dirname, '../../uploads', folder, filename)
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } catch (fileError) {
        // Log l'erreur mais ne bloque pas la suppression du média
        console.error('Error deleting media file:', fileError)
      }
    }

    // Supprimer la miniature si elle existe
    if (media.thumbnail_url) {
      try {
        const fs = await import('fs')
        const path = await import('path')
        const { fileURLToPath } = await import('url')
        
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)
        
        // Extraire le nom du fichier de l'URL
        const urlParts = media.thumbnail_url.split('/')
        const filename = urlParts[urlParts.length - 1]
        const filePath = path.join(__dirname, '../../uploads/thumbnails', filename)
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } catch (fileError) {
        // Log l'erreur mais ne bloque pas la suppression du média
        console.error('Error deleting thumbnail file:', fileError)
      }
    }

    res.status(200).json({ message: 'Média supprimé avec succès' })
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message })
    }
    console.error('Error deleting media:', error)
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du média' })
  }
}

