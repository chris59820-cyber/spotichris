/**
 * Script pour ajouter des médias (musique ou vidéo) à la base de données
 * 
 * Usage:
 *   tsx src/db/scripts/add-media.ts music "Titre" "Artiste" "Album" 180 "url_audio.mp3"
 *   tsx src/db/scripts/add-media.ts video "Titre" "Description" 3600 "url_video.mp4"
 * 
 * Ou avec fichier JSON:
 *   tsx src/db/scripts/add-media.ts --file media-list.json
 */

import pool from '../../config/database.js'
import { MediaModel, MediaType } from '../../models/Media.model.js'
import fs from 'fs'
import path from 'path'

interface MediaInput {
  title: string
  description?: string
  artist?: string
  album?: string
  duration?: number
  type: MediaType
  url?: string
  thumbnail_url?: string
}

async function addMedia(media: MediaInput) {
  try {
    const created = await MediaModel.create(media)
    console.log(`✅ Media ajouté: ${created.title} (ID: ${created.id})`)
    return created
  } catch (error: any) {
    console.error(`❌ Erreur lors de l'ajout: ${error.message}`)
    throw error
  }
}

async function addMediaFromFile(filePath: string) {
  const fullPath = path.resolve(filePath)
  
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Fichier non trouvé: ${fullPath}`)
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8')
  const mediaList: MediaInput[] = JSON.parse(content)
  
  console.log(`📄 Lecture de ${mediaList.length} médias depuis ${filePath}`)
  
  for (const media of mediaList) {
    await addMedia(media)
  }
  
  console.log(`\n✅ ${mediaList.length} médias ajoutés avec succès!`)
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage:
  # Ajouter une musique
  tsx src/db/scripts/add-media.ts music "Titre" "Artiste" "Album" 180 "url_audio.mp3" "url_thumbnail.jpg"
  
  # Ajouter une vidéo
  tsx src/db/scripts/add-media.ts video "Titre" "Description" 3600 "url_video.mp4" "url_thumbnail.jpg"
  
  # Ajouter depuis un fichier JSON
  tsx src/db/scripts/add-media.ts --file media-list.json
  
Exemple de fichier JSON (media-list.json):
[
  {
    "title": "Ma Chanson",
    "artist": "Mon Artiste",
    "album": "Mon Album",
    "duration": 240,
    "type": "music",
    "url": "https://example.com/audio.mp3",
    "thumbnail_url": "https://example.com/cover.jpg"
  },
  {
    "title": "Ma Vidéo",
    "description": "Description de la vidéo",
    "duration": 3600,
    "type": "video",
    "url": "https://example.com/video.mp4",
    "thumbnail_url": "https://example.com/thumbnail.jpg"
  }
]
`)
    process.exit(0)
  }
  
  if (args[0] === '--file') {
    if (!args[1]) {
      console.error('❌ Veuillez spécifier le chemin du fichier JSON')
      process.exit(1)
    }
    await addMediaFromFile(args[1])
    await pool.end()
    process.exit(0)
  }
  
  const type = args[0] as MediaType
  
  if (type !== 'music' && type !== 'video') {
    console.error('❌ Type doit être "music" ou "video"')
    process.exit(1)
  }
  
  let media: MediaInput
  
  if (type === 'music') {
    if (args.length < 5) {
      console.error('❌ Usage musique: music "Titre" "Artiste" "Album" durée [url] [thumbnail]')
      process.exit(1)
    }
    
    media = {
      title: args[1],
      artist: args[2],
      album: args[3],
      duration: parseInt(args[4], 10),
      type: 'music',
      url: args[5] || undefined,
      thumbnail_url: args[6] || undefined,
    }
  } else {
    if (args.length < 4) {
      console.error('❌ Usage vidéo: video "Titre" "Description" durée [url] [thumbnail]')
      process.exit(1)
    }
    
    media = {
      title: args[1],
      description: args[2],
      duration: parseInt(args[3], 10),
      type: 'video',
      url: args[4] || undefined,
      thumbnail_url: args[5] || undefined,
    }
  }
  
  await addMedia(media)
  await pool.end()
}

main().catch((error) => {
  console.error('❌ Erreur:', error.message)
  process.exit(1)
})







