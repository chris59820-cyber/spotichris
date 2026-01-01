# API Médias - Documentation

## Endpoints

### GET /api/media

Récupère une liste de médias avec pagination et filtres.

**Query Parameters:**
- `type` (optionnel): `music` ou `video` - Filtrer par type de média
- `limit` (optionnel): Nombre de résultats à retourner (défaut: 50, max: 100)
- `offset` (optionnel): Offset pour la pagination (défaut: 0)

**Exemple de requête:**
```
GET /api/media?type=music&limit=20&offset=0
```

**Réponse:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Bohemian Rhapsody",
      "description": "One of the greatest rock songs of all time",
      "artist": "Queen",
      "album": "A Night at the Opera",
      "duration": 355,
      "type": "music",
      "url": "https://example.com/audio/bohemian-rhapsody.mp3",
      "thumbnail_url": "https://example.com/images/queen-a-night-at-opera.jpg",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

---

### GET /api/media/:id

Récupère un média spécifique par son ID.

**Paramètres de route:**
- `id` (requis): ID du média

**Exemple de requête:**
```
GET /api/media/1
```

**Réponse:**
```json
{
  "id": 1,
  "title": "Bohemian Rhapsody",
  "description": "One of the greatest rock songs of all time",
  "artist": "Queen",
  "album": "A Night at the Opera",
  "duration": 355,
  "type": "music",
  "url": "https://example.com/audio/bohemian-rhapsody.mp3",
  "thumbnail_url": "https://example.com/images/queen-a-night-at-opera.jpg",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Erreurs:**
- `404 Not Found`: Si le média n'existe pas
- `400 Bad Request`: Si l'ID est invalide

---

### POST /api/media

Crée un nouveau média. **Authentification requise.**

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "title": "Nouveau Titre",
  "description": "Description du média",
  "artist": "Nom de l'artiste", // Requis pour type="music"
  "album": "Nom de l'album",
  "duration": 240, // en secondes
  "type": "music", // "music" ou "video"
  "url": "https://example.com/media.mp3",
  "thumbnail_url": "https://example.com/thumbnail.jpg"
}
```

**Réponse (201 Created):**
```json
{
  "id": 123,
  "title": "Nouveau Titre",
  "description": "Description du média",
  "artist": "Nom de l'artiste",
  "album": "Nom de l'album",
  "duration": 240,
  "type": "music",
  "url": "https://example.com/media.mp3",
  "thumbnail_url": "https://example.com/thumbnail.jpg",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

**Erreurs:**
- `400 Bad Request`: Si des champs requis sont manquants ou invalides
- `401 Unauthorized`: Si non authentifié

**Règles de validation:**
- `title` (requis): Le titre du média
- `type` (requis): Doit être "music" ou "video"
- `artist` (requis): Si type="music", l'artiste est requis
- `duration` (optionnel): Nombre entier en secondes
- `url` (optionnel): URL du fichier média
- `thumbnail_url` (optionnel): URL de l'image miniature

---

## Exemples d'utilisation

### Récupérer toutes les musiques
```bash
curl http://localhost:3000/api/media?type=music
```

### Récupérer toutes les vidéos
```bash
curl http://localhost:3000/api/media?type=video
```

### Récupérer avec pagination
```bash
curl http://localhost:3000/api/media?limit=10&offset=20
```

### Récupérer un média spécifique
```bash
curl http://localhost:3000/api/media/1
```

### Créer un nouveau média (avec authentification)
```bash
curl -X POST http://localhost:3000/api/media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ma Nouvelle Chanson",
    "artist": "Mon Artiste",
    "type": "music",
    "duration": 180
  }'
```

---

## Notes

- Les routes GET sont publiques (pas d'authentification requise)
- La route POST nécessite une authentification JWT
- La pagination utilise `limit` et `offset` pour un contrôle précis
- Les résultats sont triés par date de création (plus récent en premier)






