# Configuration Android Auto pour Spotichris

Ce document décrit la configuration complète d'Android Auto pour l'application Android Spotichris.

## Fichiers de Configuration

### 1. AndroidManifest.xml

Le fichier `AndroidManifest.xml` contient toutes les configurations nécessaires pour Android Auto :

#### Permissions

- **`INTERNET`** : Pour charger l'application web
- **`ACCESS_NETWORK_STATE`** : Pour vérifier la connexion réseau
- **`WAKE_LOCK`** : Pour maintenir l'écran allumé pendant la lecture
- **`FOREGROUND_SERVICE`** : Pour les services en premier plan
- **`FOREGROUND_SERVICE_MEDIA_PLAYBACK`** : Pour le service de lecture média

#### Services

- **`MediaBrowserService`** : Service principal pour Android Auto
  - **`android:exported="true"`** : Permet à Android Auto d'y accéder
  - **`intent-filter`** : Filtre pour `android.media.browse.MediaBrowserService`

- **`MediaPlaybackService`** : Service de notification pour la lecture en arrière-plan
  - **`foregroundServiceType="mediaPlayback"`** : Type de service en premier plan

#### Métadonnées

- **`com.google.android.gms.car.application`** : Pointe vers `automotive_app_desc.xml`
- **`android.media.browse.BROWSABLE_ROOT`** : Définit la racine navigable

### 2. MediaBrowserService.kt

Le `MediaBrowserService` gère toute l'interaction avec Android Auto :

#### Fonctionnalités principales

1. **Gestion de la MediaSession** :
   - Création et configuration de la session
   - Gestion des callbacks (play, pause, next, previous, seek)
   - Mise à jour de l'état de lecture

2. **Navigation dans le contenu** :
   - `onGetRoot()` : Retourne la racine navigable
   - `onLoadChildren()` : Charge les éléments enfants
   - Support des favoris, playlists, musique récente

3. **Métadonnées** :
   - `updateMetadata()` : Met à jour les métadonnées du média
   - Titre, Artiste, Album, Durée, Artwork

4. **État de lecture** :
   - `updatePlaybackState()` : Met à jour l'état (playing, paused, stopped)
   - Position actuelle, vitesse de lecture

### 3. automotive_app_desc.xml

Le fichier `automotive_app_desc.xml` déclare les fonctionnalités disponibles :

- **`<uses name="media" />`** : Active le support média pour Android Auto

### 4. MainActivity.kt

Le `MainActivity` sert de pont entre Android Auto et l'application web :

- **`handleAndroidAutoCommand()`** : Reçoit les commandes depuis Android Auto
- **`getPlaybackState()`** : Récupère l'état de lecture depuis l'application web
- **`setupPlaybackStateListener()`** : Configure l'écoute des changements d'état
- **`@JavascriptInterface`** : Interface pour la communication JavaScript ↔ Kotlin

### 5. MediaPlaybackService.kt

Le `MediaPlaybackService` gère les notifications pour la lecture en arrière-plan :

- Notification persistante pendant la lecture
- Actions de contrôle (play, pause, stop)
- Nécessaire pour Android Auto et la lecture en arrière-plan

## Configuration dans Android Studio

### 1. Gradle

Les dépendances nécessaires sont déjà configurées dans `build.gradle` :

```gradle
implementation 'androidx.media:media:1.7.0'
```

### 2. Permissions

Les permissions sont déclarées dans `AndroidManifest.xml`. Pour Android 12+ (API 31+), certaines permissions nécessitent une demande runtime.

### 3. ProGuard

Si vous utilisez ProGuard, ajoutez les règles dans `proguard-rules.pro` :

```proguard
-keep class com.spotichris.MediaBrowserService { *; }
-keep class com.spotichris.MainActivity { *; }
```

## Types d'Applications Android Auto

Spotichris utilise le type **"Media App"** qui permet :
- Lecture audio et vidéo
- Navigation dans les bibliothèques
- Contrôles de lecture
- Métadonnées des médias

## Synchronisation avec l'Application Web

### Flux de données

```
Android Auto → MediaBrowserService → MainActivity → WebView (React) → Backend
                                                          ↓
Backend → WebSocket → WebView (React) → MainActivity → MediaBrowserService → Android Auto
```

### Commandes depuis Android Auto

1. L'utilisateur appuie sur un bouton dans Android Auto
2. `MediaSession.Callback` déclenche la commande
3. `MainActivity.handleAndroidAutoCommand()` est appelé
4. La commande est envoyée à l'application web via JavaScript
5. L'application web exécute la commande

### Mises à jour vers Android Auto

1. L'état de lecture change dans l'application web
2. Un événement est émis vers le WebView
3. `MainActivity.onPlaybackStateChanged()` est appelé via `@JavascriptInterface`
4. `MediaBrowserService.updateMetadata()` et `updatePlaybackState()` sont appelés
5. Les métadonnées sont mises à jour via `MediaSession`

## Test d'Android Auto

### Appareil réel

1. Installer l'application sur un appareil Android
2. Connecter l'appareil à un système Android Auto compatible
3. L'application devrait apparaître dans Android Auto
4. Tester les commandes de lecture

### Émulateur

Android Auto nécessite généralement un appareil réel. Certains émulateurs peuvent fonctionner avec des configurations spéciales.

### Vérifications

- ✅ L'application apparaît dans Android Auto
- ✅ Les commandes fonctionnent (play, pause, etc.)
- ✅ Les métadonnées s'affichent correctement
- ✅ La navigation dans les bibliothèques fonctionne
- ✅ La synchronisation avec l'application web fonctionne

## Dépannage

### L'application n'apparaît pas dans Android Auto

1. Vérifier que `MediaBrowserService` est déclaré dans `AndroidManifest.xml`
2. Vérifier que `automotive_app_desc.xml` existe et contient `<uses name="media" />`
3. Vérifier que le service est `exported="true"`
4. Vérifier les logs pour les erreurs

### Les commandes ne fonctionnent pas

1. Vérifier que `MediaSession.Callback` est correctement configuré
2. Vérifier que `MainActivity` est correctement référencée
3. Vérifier les logs pour les erreurs JavaScript
4. Vérifier que l'application web est chargée

### Les métadonnées ne s'affichent pas

1. Vérifier que `updateMetadata()` est appelé
2. Vérifier que les données sont correctement formatées
3. Vérifier que `MediaSession` est active
4. Vérifier les logs pour les erreurs

### La synchronisation ne fonctionne pas

1. Vérifier que `setupPlaybackStateListener()` est appelé
2. Vérifier que `@JavascriptInterface` est correctement configuré
3. Vérifier que l'application web émet les événements correctement
4. Vérifier que WebSocket est connecté
5. Vérifier les logs pour les erreurs de communication

## Commandes Supportées

- **Play** : Démarrer la lecture
- **Pause** : Mettre en pause
- **Stop** : Arrêter la lecture
- **Next** : Piste suivante
- **Previous** : Piste précédente
- **Seek To** : Aller à une position spécifique
- **Fast Forward** : Avancer rapidement
- **Rewind** : Reculer rapidement
- **Set Playback Speed** : Changer la vitesse de lecture

## Métadonnées Supportées

- **Title** : Titre du média
- **Artist** : Artiste
- **Album** : Album
- **Duration** : Durée totale
- **Artwork** : Image de couverture
- **Media ID** : Identifiant unique

## Ressources

- [Android Auto Documentation](https://developer.android.com/training/cars/media)
- [MediaBrowserService Guide](https://developer.android.com/guide/topics/media-apps/audio-app/building-a-mediabrowserservice)
- [MediaSession API](https://developer.android.com/reference/android/media/session/MediaSession)







