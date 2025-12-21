# Documentation API

## Base URL

```
http://localhost:3000/api
```

## Authentification

La plupart des endpoints nécessitent un token JWT dans le header :

```
Authorization: Bearer <token>
```

## Endpoints

### Authentification

#### POST /api/auth/register
Inscription d'un nouvel utilisateur

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username"
}
```

#### POST /api/auth/login
Connexion

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### POST /api/auth/refresh
Rafraîchir le token

**Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### Recherche

#### GET /api/search?q=query&type=all
Recherche unifiée (musique + vidéo)

**Query Parameters:**
- `q` (required): Terme de recherche
- `type`: `all`, `music`, `video` (default: `all`)

**Response:**
```json
{
  "music": [...],
  "video": [...]
}
```

### Médias

#### GET /api/media
Liste des médias avec filtres optionnels

**Query Parameters:**
- `type`: `music` ou `video` (optionnel)
- `limit`: Nombre de résultats (défaut: 50)
- `offset`: Offset pour pagination (défaut: 0)

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

#### GET /api/media/:id
Récupérer un média spécifique par ID

**Response:**
```json
{
  "id": 1,
  "title": "Bohemian Rhapsody",
  "artist": "Queen",
  "album": "A Night at the Opera",
  "duration": 355,
  "type": "music",
  "url": "https://example.com/audio/bohemian-rhapsody.mp3",
  "thumbnail_url": "https://example.com/images/queen.jpg",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### GET /api/media/:id/stream
Récupérer l'URL de streaming d'un média (pour futur usage)

**Response:**
```json
{
  "stream_url": "https://stream.example.com/media/1",
  "expires_at": "2024-01-01T01:00:00Z"
}
```

### Playlists

#### GET /api/playlists
Liste des playlists de l'utilisateur

#### POST /api/playlists
Créer une playlist

#### GET /api/playlists/:id
Récupérer une playlist

#### PUT /api/playlists/:id
Modifier une playlist

#### DELETE /api/playlists/:id
Supprimer une playlist

### Utilisateurs

#### GET /api/users/me
Récupérer le profil de l'utilisateur connecté

#### PUT /api/users/me
Mettre à jour le profil

