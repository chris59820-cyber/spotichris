# Guide pour Ajouter des Médias à la Base de Données

Ce guide explique comment ajouter des fichiers de musique ou de vidéo à la base de données Spotichris.

## Méthodes Disponibles

Il existe plusieurs méthodes pour ajouter des médias :

1. **Via le script utilitaire** (recommandé pour développement)
2. **Via l'API REST** (pour intégration avec d'autres applications)
3. **Via SQL direct** (pour des opérations en masse)

---

## Méthode 1 : Script Utilitaire (Recommandé)

### Ajouter une musique

```bash
cd backend
npm run db:add-media music "Titre de la chanson" "Nom de l'artiste" "Nom de l'album" 180 "url_audio.mp3" "url_cover.jpg"
```

**Paramètres :**
- `music` : Type de média
- `"Titre de la chanson"` : Titre (requis)
- `"Nom de l'artiste"` : Artiste (requis pour musique)
- `"Nom de l'album"` : Album (requis pour musique)
- `180` : Durée en secondes (requis)
- `"url_audio.mp3"` : URL du fichier audio (optionnel)
- `"url_cover.jpg"` : URL de la pochette (optionnel)

**Exemple :**
```bash
npm run db:add-media music "Bohemian Rhapsody" "Queen" "A Night at the Opera" 355 "https://example.com/audio/bohemian-rhapsody.mp3" "https://example.com/images/queen-cover.jpg"
```

### Ajouter une vidéo

```bash
cd backend
npm run db:add-media video "Titre de la vidéo" "Description" 3600 "url_video.mp4" "url_thumbnail.jpg"
```

**Paramètres :**
- `video` : Type de média
- `"Titre de la vidéo"` : Titre (requis)
- `"Description"` : Description (requis pour vidéo)
- `3600` : Durée en secondes (requis)
- `"url_video.mp4"` : URL du fichier vidéo (optionnel)
- `"url_thumbnail.jpg"` : URL de la miniature (optionnel)

**Exemple :**
```bash
npm run db:add-media video "The Matrix" "A computer hacker learns about the true nature of reality" 8160 "https://example.com/video/matrix.mp4" "https://example.com/images/matrix.jpg"
```

### Ajouter plusieurs médias depuis un fichier JSON

Créez un fichier JSON (exemple : `media-list.json`) :

```json
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
```

Puis exécutez :

```bash
npm run db:add-media --file media-list.json
```

Vous pouvez utiliser le fichier exemple : `backend/src/db/scripts/media-list-example.json`

---

## Méthode 2 : Via l'API REST

### Endpoint

```
POST /api/media
```

### Authentification

Nécessite un token JWT (connectez-vous d'abord).

### Headers

```
Authorization: Bearer <votre_token>
Content-Type: application/json
```

### Body pour une musique

```json
{
  "title": "Bohemian Rhapsody",
  "artist": "Queen",
  "album": "A Night at the Opera",
  "duration": 355,
  "type": "music",
  "url": "https://example.com/audio/bohemian-rhapsody.mp3",
  "thumbnail_url": "https://example.com/images/queen-cover.jpg"
}
```

### Body pour une vidéo

```json
{
  "title": "The Matrix",
  "description": "A computer hacker learns about the true nature of reality",
  "duration": 8160,
  "type": "video",
  "url": "https://example.com/video/matrix.mp4",
  "thumbnail_url": "https://example.com/images/matrix.jpg"
}
```

### Exemple avec curl

```bash
# 1. Connectez-vous pour obtenir un token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spotichris.com","password":"password123"}' \
  | jq -r '.token')

# 2. Ajoutez un média
curl -X POST http://localhost:3000/api/media \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ma Nouvelle Chanson",
    "artist": "Mon Artiste",
    "album": "Mon Album",
    "duration": 240,
    "type": "music",
    "url": "https://example.com/audio.mp3"
  }'
```

---

## Méthode 3 : Via SQL Direct

Pour ajouter directement via SQL (utile pour des imports en masse) :

```sql
INSERT INTO media (title, description, artist, album, duration, type, url, thumbnail_url, created_at, updated_at)
VALUES
('Titre de la chanson', 'Description optionnelle', 'Artiste', 'Album', 240, 'music', 'https://example.com/audio.mp3', 'https://example.com/cover.jpg', NOW(), NOW()),
('Titre de la vidéo', 'Description', NULL, NULL, 3600, 'video', 'https://example.com/video.mp4', 'https://example.com/thumbnail.jpg', NOW(), NOW());
```

---

## Stockage des Fichiers

### Option 1 : URLs Externes

Vous pouvez utiliser des URLs vers des fichiers hébergés ailleurs :

```json
{
  "url": "https://votre-serveur.com/media/audio.mp3",
  "thumbnail_url": "https://votre-serveur.com/media/cover.jpg"
}
```

### Option 2 : Fichiers Locaux (Futur)

Pour l'instant, l'application utilise des URLs. Pour ajouter le support de fichiers locaux :

1. **Configurer un dossier de stockage** dans `backend/uploads/`
2. **Installer un middleware de gestion de fichiers** (ex: `multer`)
3. **Ajouter un endpoint pour l'upload**
4. **Stockez le chemin relatif dans la base de données**

Exemple de structure future :
```
backend/
  uploads/
    music/
      audio1.mp3
      audio2.mp3
    video/
      video1.mp4
      video2.mp4
    thumbnails/
      cover1.jpg
      cover2.jpg
```

---

## Format des URLs

Les URLs peuvent être :
- **URLs HTTP/HTTPS** : `https://example.com/media.mp3`
- **Chemins relatifs** : `/uploads/music/song.mp3` (si servi par le backend)
- **Données base64** : `data:audio/mpeg;base64,...` (non recommandé pour gros fichiers)

---

## Exemples Pratiques

### Ajouter plusieurs chansons d'un album

Créez un fichier `album-queen.json` :

```json
[
  {
    "title": "Bohemian Rhapsody",
    "artist": "Queen",
    "album": "A Night at the Opera",
    "duration": 355,
    "type": "music",
    "url": "https://example.com/queen/bohemian-rhapsody.mp3",
    "thumbnail_url": "https://example.com/queen/cover.jpg"
  },
  {
    "title": "Love of My Life",
    "artist": "Queen",
    "album": "A Night at the Opera",
    "duration": 219,
    "type": "music",
    "url": "https://example.com/queen/love-of-my-life.mp3",
    "thumbnail_url": "https://example.com/queen/cover.jpg"
  }
]
```

Puis :
```bash
npm run db:add-media --file album-queen.json
```

### Vérifier les médias ajoutés

```bash
# Via psql
psql -U postgres -d spotichris -c "SELECT id, title, artist, type FROM media ORDER BY created_at DESC LIMIT 10;"
```

---

## Notes Importantes

1. **Authentification requise** : L'API nécessite une authentification (sauf pour la lecture)
2. **Validation** : Le type doit être `music` ou `video`
3. **Artiste requis** : Pour les médias de type `music`, l'artiste est requis
4. **Durée** : La durée est en secondes (ex: 240 = 4 minutes)
5. **URLs** : Les URLs doivent être accessibles publiquement (ou depuis votre serveur)

---

## Dépannage

### Erreur "Type must be music or video"
Vérifiez que vous avez bien spécifié `music` ou `video` comme premier argument.

### Erreur "Artist is required for music media"
Pour les médias de type `music`, vous devez fournir un artiste.

### Les fichiers ne se chargent pas
- Vérifiez que les URLs sont accessibles
- Vérifiez que les URLs sont correctes (pas d'erreurs 404)
- Vérifiez les logs du backend pour les erreurs de chargement








