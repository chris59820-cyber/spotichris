import { Request, Response } from 'express'
import { uploadMedia, getPublicUrl } from '../config/upload'
import { authenticateToken } from '../middleware/auth.middleware'

/**
 * Upload un fichier média et retourne l'URL publique
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.files || !('file' in req.files) || !(req.files as any).file?.[0]) {
      return res.status(400).json({ message: 'Aucun fichier fourni' })
    }

    const file = (req.files as any).file[0]
    const mediaType = (req.body.type || 'music') as 'music' | 'video'
    
    const fileUrl = getPublicUrl(file.filename, mediaType)
    
    let thumbnailUrl = null
    if ('thumbnail' in req.files && (req.files as any).thumbnail?.[0]) {
      const thumbnail = (req.files as any).thumbnail[0]
      thumbnailUrl = getPublicUrl(thumbnail.filename, 'thumbnail')
    }

    res.json({
      file_url: fileUrl,
      thumbnail_url: thumbnailUrl,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    res.status(500).json({ message: error.message || 'Erreur lors de l\'upload' })
  }
}

