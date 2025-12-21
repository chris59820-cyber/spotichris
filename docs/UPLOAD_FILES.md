# Guide pour Ajouter des Fichiers Locaux

Ce guide explique comment ajouter des fichiers de musique ou de vidéo locaux (sur votre ordinateur) dans la base de données.

## Méthodes Disponibles

### Méthode 1 : Script Utilitaire (Recommandé)

Le script `add-media-local.ts` copie automatiquement vos fichiers dans le dossier `backend/uploads/` et crée les entrées dans la base de données.

#### Ajouter une musique

```bash
cd backend
npm run db:add-media-local music "Titre de la chanson" "Artiste" "Album" 180 "./chemin/vers/audio.mp3" "./chemin/vers/cover.jpg"
```

**Exemple :**
```bash
npm run db:add-media-local music "Ma Chanson" "Mon Artiste" "Mon Album" 240 "C:/Users/MonNom/Music/chanson.mp3" "C:/Users/MonNom/Images/cover.jpg"
```

**Paramètres :**
- `music` : Type de média
- `"Titre de la chanson"` : Titre (requis)
- `"Artiste"` : Nom de l'artiste (requis)
- `"Album"` : Nom de l'album (requis)
- `180` : Durée en secondes (requis)
- `"./audio.mp3"` : Chemin vers le fichier audio (requis)
- `"./cover.jpg"` : Chemin vers l'image de couverture (optionnel)

#### Ajouter une vidéo

```bash
cd backend
npm run db:add-media-local video "Titre de la vidéo" "Description" 3600 "./chemin/vers/video.mp4" "./chemin/vers/thumbnail.jpg"
```

**Exemple :**
```bash
npm run db:add-media-local video "Ma Vidéo" "Description de ma vidéo" 1800 "C:/Users/MonNom/Videos/video.mp4" "C:/Users/MonNom/Images/thumbnail.jpg"
```

**Paramètres :**
- `video` : Type de média
- `"Titre de la vidéo"` : Titre (requis)
- `"Description"` : Description (requis)
- `3600` : Durée en secondes (requis)
- `"./video.mp4"` : Chemin vers le fichier vidéo (requis)
- `"./thumbnail.jpg"` : Chemin vers la miniature (optionnel)

---

### Méthode 2 : Via l'API REST (Interface Web)

Vous pouvez créer une interface web pour uploader des fichiers via l'API.

#### Endpoint d'Upload

```
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

#### Formulaire HTML d'exemple

```html
<form action="http://localhost:3000/api/upload" method="post" enctype="multipart/form-data">
  <input type="hidden" name="type" value="music">
  <input type="file" name="file" accept="audio/*">
  <input type="file" name="thumbnail" accept="image/*">
  <button type="submit">Uploader</button>
</form>
```

#### Avec curl

```bash
# 1. Connectez-vous pour obtenir un token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spotichris.com","password":"password123"}' \
  | jq -r '.token')

# 2. Uploader un fichier
curl -X POST http://localhost:3000/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "type=music" \
  -F "file=@./ma-chanson.mp3" \
  -F "thumbnail=@./cover.jpg"
```

#### Ensuite, créer le média avec l'URL retournée

```bash
curl -X POST http://localhost:3000/api/media \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ma Chanson",
    "artist": "Mon Artiste",
    "album": "Mon Album",
    "duration": 240,
    "type": "music",
    "url": "http://localhost:3000/uploads/music/ma-chanson-1234567890.mp3",
    "thumbnail_url": "http://localhost:3000/uploads/thumbnails/cover-1234567890.jpg"
  }'
```

#### Upload et création en une seule requête

Vous pouvez aussi uploader le fichier directement lors de la création du média :

```bash
curl -X POST http://localhost:3000/api/media \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Ma Chanson" \
  -F "artist=Mon Artiste" \
  -F "album=Mon Album" \
  -F "duration=240" \
  -F "type=music" \
  -F "file=@./ma-chanson.mp3" \
  -F "thumbnail=@./cover.jpg"
```

---

## Structure des Dossiers

Les fichiers sont organisés ainsi :

```
backend/
  uploads/
    music/          # Fichiers audio
      chanson1.mp3
      chanson2.mp3
    video/          # Fichiers vidéo
      video1.mp4
      video2.mp4
    thumbnails/     # Images (covers, thumbnails)
      cover1.jpg
      thumbnail1.jpg
```

---

## Formats de Fichiers Supportés

### Audio
- MP3 (`.mp3`)
- WAV (`.wav`)
- FLAC (`.flac`)
- AAC (`.aac`)
- OGG (`.ogg`)

### Vidéo
- MP4 (`.mp4`)
- WebM (`.webm`)
- OGG (`.ogg`)
- QuickTime (`.mov`)
- AVI (`.avi`)

### Images (Miniatures)
- JPEG/JPG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

---

## Limites

- **Taille maximale** : 500 MB par fichier
- **Authentification** : Requise pour uploader
- **Stockage** : Les fichiers sont stockés localement dans `backend/uploads/`

---

## Accès aux Fichiers

Une fois uploadés, les fichiers sont accessibles via :

```
http://localhost:3000/uploads/music/nom-du-fichier.mp3
http://localhost:3000/uploads/video/nom-du-fichier.mp4
http://localhost:3000/uploads/thumbnails/nom-de-l-image.jpg
```

Ces URLs sont automatiquement générées et sauvegardées dans la base de données.

---

## Exemples Pratiques

### Ajouter plusieurs fichiers d'un album

Créez un script PowerShell ou bash :

```powershell
# Windows PowerShell
$files = Get-ChildItem "C:\Users\MonNom\Music\Album\*.mp3"
$album = "Mon Album"
$artist = "Mon Artiste"

foreach ($file in $files) {
    $duration = 180  # À ajuster selon le fichier réel
    npm run db:add-media-local music $file.BaseName $artist $album $duration $file.FullName
}
```

### Trouver la durée d'un fichier audio/vidéo

Pour obtenir la durée réelle d'un fichier, vous pouvez utiliser :

**Windows :**
```powershell
# Avec PowerShell (nécessite ffmpeg)
ffprobe -i "fichier.mp3" -show_entries format=duration -v quiet -of csv="p=0"
```

**Linux/Mac :**
```bash
ffprobe -i fichier.mp3 -show_entries format=duration -v quiet -of csv="p=0"
```

---

## Sécurité

⚠️ **Important :**
- Les fichiers uploadés sont accessibles publiquement via les URLs
- Assurez-vous que votre serveur backend n'est pas exposé publiquement si vous stockez des fichiers sensibles
- En production, utilisez un stockage cloud (AWS S3, Cloudinary, etc.) au lieu du stockage local

---

## Dépannage

### Erreur "Fichier source non trouvé"
- Vérifiez que le chemin du fichier est correct
- Utilisez des chemins absolus si nécessaire
- Sur Windows, utilisez des backslashes `\` ou des guillemets autour du chemin

### Erreur "Type de fichier non supporté"
- Vérifiez que le format du fichier est dans la liste des formats supportés
- Vérifiez l'extension du fichier

### Les fichiers ne se chargent pas dans le lecteur
- Vérifiez que le serveur backend est démarré
- Vérifiez que les fichiers sont bien dans `backend/uploads/`
- Vérifiez que l'URL dans la base de données est correcte

### Erreur de taille de fichier
- La limite est de 500 MB par fichier
- Pour des fichiers plus gros, augmentez la limite dans `backend/src/config/upload.ts`

