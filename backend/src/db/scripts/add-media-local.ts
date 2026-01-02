/**
 * Script pour ajouter des médias avec fichiers locaux
 * 
 * Usage:
 *   tsx src/db/scripts/add-media-local.ts music "Titre" "Artiste" "Album" 180 "./audio.mp3" "./cover.jpg"
 *   tsx src/db/scripts/add-media-local.ts video "Titre" "Description" 3600 "./video.mp4" "./thumbnail.jpg"
 */

import pool from '../../config/database.js'
import { MediaModel } from '../../models/Media.model.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Dossiers d'upload
const uploadsDir = path.join(__dirname, '../../../uploads')
const musicDir = path.join(uploadsDir, 'music')
const videoDir = path.join(uploadsDir, 'video')
const thumbnailsDir = path.join(uploadsDir, 'thumbnails')

// Créer les dossiers s'ils n'existent pas
;[uploadsDir, musicDir, videoDir, thumbnailsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
})

function copyFileToUploads(sourcePath: string, type: 'music' | 'video' | 'thumbnail'): string {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Fichier source non trouvé: ${sourcePath}`)
  }

  const targetDir = type === 'music' ? musicDir : type === 'video' ? videoDir : thumbnailsDir
  const filename = path.basename(sourcePath)
  const ext = path.extname(filename)
  const nameWithoutExt = path.basename(filename, ext).replace(/[^a-z0-9]/gi, '-')
  const uniqueFilename = `${nameWithoutExt}-${Date.now()}${ext}`
  const targetPath = path.join(targetDir, uniqueFilename)

  fs.copyFileSync(sourcePath, targetPath)
  console.log(`✅ Fichier copié: ${sourcePath} -> ${targetPath}`)

  // Retourner l'URL publique
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  const folder = type === 'music' ? 'music' : type === 'video' ? 'video' : 'thumbnails'
  return `${baseUrl}/uploads/${folder}/${uniqueFilename}`
}

async function addMediaLocal(args: string[]) {
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage:
  # Ajouter une musique avec fichier local
  tsx src/db/scripts/add-media-local.ts music "Titre" "Artiste" "Album" 180 "./audio.mp3" ["./cover.jpg"]
  
  # Ajouter une vidéo avec fichier local
  tsx src/db/scripts/add-media-local.ts video "Titre" "Description" 3600 "./video.mp4" ["./thumbnail.jpg"]

Paramètres:
  - type: "music" ou "video"
  - titre: Titre du média
  - artiste/description: Artiste (musique) ou Description (vidéo)
  - album: Album (uniquement pour musique)
  - durée: Durée en secondes
  - fichier: Chemin vers le fichier audio/vidéo
  - miniature: Chemin vers le fichier image (optionnel)
`)
    process.exit(0)
  }

  const type = args[0] as 'music' | 'video'

  if (type !== 'music' && type !== 'video') {
    console.error('❌ Type doit être "music" ou "video"')
    process.exit(1)
  }

  let mediaData: any

  if (type === 'music') {
    if (args.length < 6) {
      console.error('❌ Usage musique: music "Titre" "Artiste" "Album" durée "./audio.mp3" ["./cover.jpg"]')
      process.exit(1)
    }

    const filePath = args[5]
    const thumbnailPath = args[6]

    const fileUrl = copyFileToUploads(filePath, 'music')
    const thumbnailUrl = thumbnailPath ? copyFileToUploads(thumbnailPath, 'thumbnail') : undefined

    mediaData = {
      title: args[1],
      artist: args[2],
      album: args[3],
      duration: parseInt(args[4], 10),
      type: 'music',
      url: fileUrl,
      thumbnail_url: thumbnailUrl,
    }
  } else {
    if (args.length < 5) {
      console.error('❌ Usage vidéo: video "Titre" "Description" durée "./video.mp4" ["./thumbnail.jpg"]')
      process.exit(1)
    }

    const filePath = args[4]
    const thumbnailPath = args[5]

    const fileUrl = copyFileToUploads(filePath, 'video')
    const thumbnailUrl = thumbnailPath ? copyFileToUploads(thumbnailPath, 'thumbnail') : undefined

    mediaData = {
      title: args[1],
      description: args[2],
      duration: parseInt(args[3], 10),
      type: 'video',
      url: fileUrl,
      thumbnail_url: thumbnailUrl,
    }
  }

  try {
    const created = await MediaModel.create(mediaData)
    console.log(`\n✅ Média ajouté avec succès!`)
    console.log(`   ID: ${created.id}`)
    console.log(`   Titre: ${created.title}`)
    console.log(`   URL: ${created.url}`)
    if (created.thumbnail_url) {
      console.log(`   Miniature: ${created.thumbnail_url}`)
    }
  } catch (error: any) {
    console.error(`❌ Erreur lors de l'ajout: ${error.message}`)
    throw error
  }
}

addMediaLocal(process.argv.slice(2))
  .then(() => {
    pool.end()
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Erreur:', error.message)
    pool.end()
    process.exit(1)
  })







