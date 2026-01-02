# WebSocket - Synchronisation Temps Réel

Ce document décrit l'implémentation WebSocket pour la synchronisation temps réel entre l'application web, les applications natives (CarPlay/Android Auto), et le backend.

## Architecture

### Technologies

- **Backend**: Socket.IO (serveur)
- **Frontend**: Socket.IO Client
- **Protocole**: WebSocket avec fallback polling

### Flux de données

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Frontend   │◄───────►│   Backend    │◄───────►│  CarPlay/   │
│   (React)   │ WebSocket│  (Socket.IO) │ WebSocket│ Android Auto │
└─────────────┘         └──────────────┘         └─────────────┘
```

## Backend

### Service WebSocket (`websocket.service.ts`)

Le service gère :
- Les connexions WebSocket avec authentification JWT
- La synchronisation de l'état de lecture entre clients
- Les commandes depuis CarPlay/Android Auto
- La gestion des déconnexions

### Événements

#### Événements reçus (du client)

- `playback_state_update`: Mise à jour de l'état de lecture
- `carplay_command`: Commande depuis CarPlay/Android Auto
- `ping`: Vérification de la connexion

#### Événements envoyés (au client)

- `playback_state`: État de lecture actuel
- `carplay_command`: Commande à exécuter
- `pong`: Réponse au ping
- `error`: Erreur d'authentification ou autre

### Authentification

Les clients doivent fournir un token JWT lors de la connexion :

```typescript
socket.io(serverUrl, {
  auth: {
    token: localStorage.getItem('token')
  }
})
```

Le serveur vérifie le token et associe le socket à un `userId`.

## Frontend

### Service CarPlay (`carplay.service.ts`)

Le service frontend :
- Se connecte automatiquement au serveur WebSocket
- Envoie les mises à jour d'état de lecture
- Reçoit et exécute les commandes depuis CarPlay/Android Auto
- Gère la reconnexion automatique

### Intégration avec PlayerContext

Le `PlayerContext` :
- Se connecte au service WebSocket au montage
- Envoie automatiquement les mises à jour d'état
- Exécute les commandes reçues depuis CarPlay/Android Auto

## Applications Natives

### iOS (CarPlay)

Les commandes CarPlay sont envoyées via JavaScript Bridge :

```swift
webView.evaluateJavaScript("window.postMessage({ type: 'CARPLAY_COMMAND', command: 'play' }, '*');")
```

L'application web écoute ces messages et les envoie au serveur WebSocket.

### Android (Android Auto)

Similaire à iOS, les commandes sont envoyées via JavaScript Bridge.

## Format des données

### PlaybackState

```typescript
interface PlaybackState {
  userId: number
  isPlaying: boolean
  currentTime: number
  duration: number
  mediaId: number | null
  mediaTitle?: string
  mediaArtist?: string
  mediaAlbum?: string
  mediaType?: 'music' | 'video'
}
```

### CarPlayCommand

```typescript
interface CarPlayCommand {
  command: 'play' | 'pause' | 'next' | 'previous' | 'seek'
  value?: number // Pour seek
}
```

## Utilisation

### Backend

Le serveur WebSocket est automatiquement initialisé dans `index.ts` :

```typescript
import { webSocketService } from './services/websocket.service'
import { createServer } from 'http'

const server = createServer(app)
webSocketService.initialize(server)
```

### Frontend

Le service se connecte automatiquement dans `PlayerContext` :

```typescript
useEffect(() => {
  carPlayService.connect(
    (state) => { /* Recevoir les mises à jour */ },
    (command) => { /* Exécuter les commandes */ }
  )
  return () => carPlayService.disconnect()
}, [])
```

## API REST pour CarPlay/Android Auto

Les endpoints REST peuvent également envoyer des commandes via WebSocket :

### POST /api/carplay/control

```json
{
  "command": "play",
  "value": null
}
```

Cette commande est transmise à tous les clients WebSocket de l'utilisateur.

### GET /api/carplay/now-playing

Retourne l'état de lecture actuel depuis le cache WebSocket.

## Dépannage

### Le WebSocket ne se connecte pas

1. Vérifier que le token JWT est valide
2. Vérifier que le serveur WebSocket est démarré
3. Vérifier les logs du serveur pour les erreurs d'authentification

### Les commandes ne fonctionnent pas

1. Vérifier que le client est connecté : `carPlayService.isConnected()`
2. Vérifier les logs du serveur pour les événements reçus
3. Vérifier que le `PlayerContext` écoute les commandes

### La synchronisation ne fonctionne pas

1. Vérifier que l'état est envoyé : `carPlayService.sendPlaybackState(state)`
2. Vérifier que le serveur reçoit les mises à jour
3. Vérifier que les autres clients reçoivent les mises à jour

## Performance

- Le WebSocket maintient une connexion persistante
- Les mises à jour sont envoyées uniquement quand l'état change
- La reconnexion automatique gère les déconnexions temporaires
- Le ping/pong maintient la connexion active

## Sécurité

- Authentification JWT requise pour toutes les connexions
- Les commandes sont associées à l'utilisateur authentifié
- Les états de lecture sont isolés par utilisateur
- Validation des commandes côté serveur







