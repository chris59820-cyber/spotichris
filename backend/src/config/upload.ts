import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Créer les dossiers d'upload s'ils n'existent pas
const uploadsDir = path.join(__dirname, '../../uploads')
const musicDir = path.join(uploadsDir, 'music')
const videoDir = path.join(uploadsDir, 'video')
const thumbnailsDir = path.join(uploadsDir, 'thumbnails')

;[uploadsDir, musicDir, videoDir, thumbnailsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fieldName = file.fieldname
    
    if (fieldName === 'file') {
      // Déterminer le type de fichier selon le type de média
      const mediaType = req.body.type || 'music'
      const destDir = mediaType === 'video' ? videoDir : musicDir
      cb(null, destDir)
    } else if (fieldName === 'thumbnail') {
      cb(null, thumbnailsDir)
    } else {
      cb(null, uploadsDir)
    }
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '-')
    cb(null, `${name}-${uniqueSuffix}${ext}`)
  },
})

// Filtre de fichiers
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const fieldName = file.fieldname
  
  if (fieldName === 'file') {
    // Fichiers média acceptés
    const allowedMimeTypes = [
      // Audio
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/flac',
      'audio/aac',
      'audio/ogg',
      'audio/x-m4a', // M4A (iTunes, Apple)
      'audio/mp4', // M4A alternative
      'audio/x-aac', // AAC alternative
      'audio/x-wav', // WAV alternative
      // Vidéo
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-msvideo', // .avi
      'video/avi', // .avi (alternative MIME type)
      'video/x-matroska', // .mkv
      'video/x-ms-wmv', // .wmv
      'video/x-flv', // .flv
      'video/3gpp', // .3gp
      'video/x-ms-asf', // .asf
    ]
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Type de fichier non supporté: ${file.mimetype}. Types acceptés: ${allowedMimeTypes.join(', ')}`))
    }
  } else if (fieldName === 'thumbnail') {
    // Images pour les miniatures
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
    
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Type d'image non supporté: ${file.mimetype}. Types acceptés: ${allowedImageTypes.join(', ')}`))
    }
  } else {
    cb(null, true)
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024, // 2 GB max
  },
})

// Middleware pour uploader un fichier média et optionnellement une miniature
export const uploadMedia = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
])

export const uploadPaths = {
  uploads: uploadsDir,
  music: musicDir,
  video: videoDir,
  thumbnails: thumbnailsDir,
}

// Fonction pour obtenir l'URL publique d'un fichier
export function getPublicUrl(filename: string, type: 'music' | 'video' | 'thumbnail'): string {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  const folder = type === 'music' ? 'music' : type === 'video' ? 'video' : 'thumbnails'
  return `${baseUrl}/uploads/${folder}/${filename}`
}

