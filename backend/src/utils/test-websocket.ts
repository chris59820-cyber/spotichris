/**
 * Script de test pour vérifier la connexion WebSocket
 * 
 * Usage: tsx src/utils/test-websocket.ts
 */

import { io } from 'socket.io-client'

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000'
const TEST_TOKEN = process.env.TEST_TOKEN || 'your-test-token-here'

console.log('🧪 Test de connexion WebSocket')
console.log(`📍 Serveur: ${SERVER_URL}`)
console.log(`🔑 Token: ${TEST_TOKEN.substring(0, 20)}...`)
console.log('')

const socket = io(SERVER_URL, {
  auth: {
    token: TEST_TOKEN,
  },
  transports: ['websocket', 'polling'],
})

let connected = false
let testResults: { [key: string]: boolean } = {}

// Test 1: Connexion
socket.on('connect', () => {
  console.log('✅ Test 1: Connexion réussie')
  testResults['connection'] = true
  connected = true

  // Test 2: Ping/Pong
  console.log('🧪 Test 2: Ping/Pong...')
  socket.emit('ping')
})

// Test 2: Ping/Pong
socket.on('pong', () => {
  console.log('✅ Test 2: Ping/Pong réussi')
  testResults['ping_pong'] = true

  // Test 3: Envoyer un état de lecture
  console.log('🧪 Test 3: Envoi d\'état de lecture...')
  socket.emit('playback_state_update', {
    isPlaying: true,
    currentTime: 30,
    duration: 180,
    mediaId: 1,
    mediaTitle: 'Test Song',
    mediaArtist: 'Test Artist',
    mediaAlbum: 'Test Album',
    mediaType: 'music',
  })
})

// Test 3: Réception de l'état
socket.on('playback_state', (state) => {
  console.log('✅ Test 3: État de lecture reçu')
  console.log('   État:', JSON.stringify(state, null, 2))
  testResults['playback_state'] = true

  // Test 4: Envoyer une commande
  console.log('🧪 Test 4: Envoi d\'une commande...')
  socket.emit('carplay_command', {
    command: 'pause',
  })
})

// Test 4: Réception de commande
socket.on('carplay_command', (command) => {
  console.log('✅ Test 4: Commande reçue')
  console.log('   Commande:', JSON.stringify(command, null, 2))
  testResults['carplay_command'] = true

  // Test 5: Déconnexion
  console.log('🧪 Test 5: Déconnexion...')
  setTimeout(() => {
    socket.disconnect()
  }, 1000)
})

// Gestion des erreurs
socket.on('error', (error: { message: string }) => {
  console.error('❌ Erreur:', error.message)
  testResults['error'] = false
  process.exit(1)
})

socket.on('connect_error', (error: Error) => {
  console.error('❌ Erreur de connexion:', error.message)
  testResults['connection'] = false
  process.exit(1)
})

socket.on('disconnect', (reason: string) => {
  console.log(`🔌 Déconnecté: ${reason}`)
  
  // Afficher les résultats
  console.log('')
  console.log('📊 Résultats des tests:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  Object.entries(testResults).forEach(([test, result]) => {
    const icon = result ? '✅' : '❌'
    console.log(`${icon} ${test}`)
  })
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const allPassed = Object.values(testResults).every((result) => result)
  if (allPassed) {
    console.log('🎉 Tous les tests sont passés!')
    process.exit(0)
  } else {
    console.log('⚠️  Certains tests ont échoué')
    process.exit(1)
  }
})

// Timeout de sécurité
setTimeout(() => {
  if (!connected) {
    console.error('❌ Timeout: La connexion n\'a pas été établie dans les 10 secondes')
    process.exit(1)
  }
}, 10000)






