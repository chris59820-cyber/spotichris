import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import multer from 'multer'
import { createServer } from 'http'
import { authRoutes } from './routes/auth.routes.js'
import { userRoutes } from './routes/user.routes.js'
import { searchRoutes } from './routes/search.routes.js'
import { mediaRoutes } from './routes/media.routes.js'
import { uploadRoutes } from './routes/upload.routes.js'
import { favoritesRoutes } from './routes/favorites.routes.js'
import { playlistRoutes } from './routes/playlist.routes.js'
import carplayRoutes from './routes/carplay.routes.js'
import { adminRoutes } from './routes/admin.routes.js'
import { checkDatabaseSetup } from './utils/check-db.js'
import { webSocketService } from './services/websocket.service.js'

dotenv.config()

const app = express()
const server = createServer(app)
const PORT = process.env.PORT || 3000

// Initialiser WebSocket
webSocketService.initialize(server)

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Servir les fichiers uploadés statiquement
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Vérifier la base de données au démarrage
checkDatabaseSetup().then(({ ok, error }) => {
  if (!ok) {
    console.error('❌ Erreur de base de données:', error)
    console.log('\n📝 Actions suggérées:')
    console.log('   1. Vérifiez que PostgreSQL est démarré')
    console.log('   2. Vérifiez votre fichier .env')
    console.log('   3. Créez la base de données: CREATE DATABASE spotichris;')
    console.log('   4. Initialisez la base: npm run db:init\n')
  } else {
    console.log('✅ Base de données OK')
  }
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/favorites', favoritesRoutes)
app.use('/api/playlists', playlistRoutes)
app.use('/api/carplay', carplayRoutes)
app.use('/api/admin', adminRoutes)

// Health check
app.get('/health', (_req, res) => {
  return res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  
  // Gestion spécifique des erreurs Multer
  if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
              return res.status(413).json({
                message: 'Le fichier est trop volumineux. Taille maximale : 2 GB',
              })
            }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Trop de fichiers uploadés',
      })
    }
    return res.status(400).json({
      message: `Erreur d'upload: ${err.message}`,
    })
  }
  
  // Gestion des erreurs de validation de fichier
  if (err.message && (err.message.includes('Type de fichier non supporté') || err.message.includes('Type d\'image non supporté'))) {
    return res.status(400).json({
      message: err.message,
    })
  }
  
  // Erreur générique
  return res.status(err.status || err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

server.listen(PORT, () => {
  console.log(`🚀 Serveur HTTP et WebSocket en cours d'exécution sur le port ${PORT}`)
  console.log(`📡 WebSocket disponible sur ws://localhost:${PORT}`)
})

