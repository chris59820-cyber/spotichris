# Configuration CarPlay pour Spotichris

Ce document décrit la configuration complète de CarPlay pour l'application iOS Spotichris.

## Fichiers de Configuration

### 1. Info.plist

Le fichier `Info.plist` contient toutes les configurations nécessaires pour CarPlay :

#### Clés CarPlay essentielles

- **`UISupportsCarPlay`** : `true` - Active le support CarPlay
- **`UIApplicationSceneManifest`** : Configuration des scènes pour iOS 13+
  - **`CPTemplateApplicationSceneSessionRoleApplication`** : Configuration de la scène CarPlay
    - **`UISceneConfigurationName`** : "CarPlayScene"
    - **`UISceneDelegateClassName`** : "Spotichris.CarPlaySceneDelegate"

#### Configuration réseau

- **`NSAppTransportSecurity`** : Configuration pour permettre les connexions HTTP locales (développement)
  - **`NSAllowsArbitraryLoads`** : `true` (développement uniquement)
  - **`NSAllowsLocalNetworking`** : `true`

#### Configuration audio

- **`UIBackgroundModes`** : `["audio"]` - Permet la lecture audio en arrière-plan
- **`AVAudioSessionCategory`** : `AVAudioSessionCategoryPlayback` - Catégorie audio pour la lecture

### 2. CarPlayManager.swift

Le `CarPlayManager` gère toute l'interaction avec CarPlay :

#### Fonctionnalités principales

1. **Templates CarPlay** :
   - `CPNowPlayingTemplate` : Template pour la lecture en cours
   - `CPTabBarTemplate` : Navigation par onglets
   - `CPListTemplate` : Listes de contenu (bibliothèque, favoris, etc.)

2. **Commandes MediaPlayer** :
   - Play, Pause, Toggle Play/Pause
   - Next Track, Previous Track
   - Seek Forward/Backward (10 secondes)
   - Change Playback Position (scrub)
   - Seek Forward/Backward (continu)

3. **Métadonnées** :
   - Titre, Artiste, Album
   - Durée, Temps actuel
   - Artwork (image)

4. **Synchronisation** :
   - Synchronisation avec l'application web via `MainViewController`
   - Mise à jour automatique des métadonnées
   - Mise à jour de l'état de lecture

### 3. CarPlaySceneDelegate.swift

Le `CarPlaySceneDelegate` gère le cycle de vie de la scène CarPlay :

- **`templateApplicationScene(_:didConnect:to:)`** : Appelé quand CarPlay se connecte
- **`templateApplicationScene(_:didDisconnect:from:)`** : Appelé quand CarPlay se déconnecte

### 4. MainViewController.swift

Le `MainViewController` sert de pont entre CarPlay et l'application web :

- **`handleCarPlayCommand(_:value:)`** : Reçoit les commandes depuis CarPlay et les envoie à l'application web
- **`getPlaybackState(completion:)`** : Récupère l'état de lecture depuis l'application web
- **`setupPlaybackStateListener()`** : Configure l'écoute des changements d'état

## Configuration dans Xcode

### 1. Capabilities

1. Ouvrir le projet dans Xcode
2. Sélectionner le target "Spotichris"
3. Aller dans "Signing & Capabilities"
4. Cliquer sur "+ Capability"
5. Ajouter "CarPlay"
6. Sélectionner "Media App" comme type d'application CarPlay

### 2. Bundle Identifier

Le Bundle Identifier doit être unique et configuré dans :
- Xcode > Target > General > Bundle Identifier
- Apple Developer Portal (pour la distribution)

### 3. Provisioning Profile

Pour tester sur un appareil réel ou distribuer :
1. Créer un App ID dans Apple Developer Portal
2. Activer CarPlay pour cet App ID
3. Créer un Provisioning Profile avec cet App ID
4. Configurer dans Xcode > Signing & Capabilities

## Types d'Applications CarPlay

Spotichris utilise le type **"Media App"** qui permet :
- Lecture audio et vidéo
- Navigation dans les bibliothèques
- Contrôles de lecture
- Métadonnées des médias

## Templates CarPlay Disponibles

### CPNowPlayingTemplate
- Affiche le média en cours de lecture
- Contrôles de lecture (play, pause, next, previous)
- Barre de progression
- Métadonnées (titre, artiste, album, artwork)

### CPTabBarTemplate
- Navigation par onglets
- Permet de basculer entre différentes sections
- Utilisé pour organiser l'interface CarPlay

### CPListTemplate
- Affiche des listes de contenu
- Utilisé pour les bibliothèques, favoris, playlists
- Supporte les actions sur les éléments

### CPGridTemplate
- Affiche une grille d'éléments
- Utilisé pour les albums, artistes, etc.

## Synchronisation avec l'Application Web

### Flux de données

```
CarPlay → CarPlayManager → MainViewController → WebView (React) → Backend
                                                      ↓
Backend → WebSocket → WebView (React) → MainViewController → CarPlayManager → CarPlay
```

### Commandes depuis CarPlay

1. L'utilisateur appuie sur un bouton dans CarPlay
2. `MPRemoteCommandCenter` déclenche la commande
3. `CarPlayManager` reçoit la commande
4. `MainViewController.handleCarPlayCommand()` est appelé
5. La commande est envoyée à l'application web via JavaScript
6. L'application web exécute la commande

### Mises à jour vers CarPlay

1. L'état de lecture change dans l'application web
2. Un événement est émis vers le WebView
3. `MainViewController` reçoit l'événement
4. `CarPlayManager.syncWithWebApp()` est appelé
5. Les métadonnées sont mises à jour via `MPNowPlayingInfoCenter`

## Test de CarPlay

### Simulateur CarPlay

1. Dans Xcode, aller dans "Window" > "Devices and Simulators"
2. Créer un simulateur CarPlay
3. Lancer l'application
4. CarPlay devrait se connecter automatiquement

### Appareil réel

1. Connecter un iPhone à un système CarPlay compatible
2. Lancer l'application sur l'iPhone
3. CarPlay devrait détecter l'application automatiquement
4. L'application devrait apparaître dans CarPlay

### Vérifications

- ✅ L'application apparaît dans CarPlay
- ✅ Le template Now Playing s'affiche
- ✅ Les commandes fonctionnent (play, pause, etc.)
- ✅ Les métadonnées s'affichent correctement
- ✅ La synchronisation avec l'application web fonctionne

## Dépannage

### L'application n'apparaît pas dans CarPlay

1. Vérifier que `UISupportsCarPlay` est `true` dans Info.plist
2. Vérifier que la capability CarPlay est activée dans Xcode
3. Vérifier que le type d'application CarPlay est correct
4. Vérifier que le Provisioning Profile inclut CarPlay

### Les commandes ne fonctionnent pas

1. Vérifier que `setupMediaPlayer()` est appelé
2. Vérifier que `MainViewController` est correctement référencé
3. Vérifier les logs pour les erreurs JavaScript
4. Vérifier que l'application web est chargée

### Les métadonnées ne s'affichent pas

1. Vérifier que `updateNowPlayingInfo()` est appelé
2. Vérifier que les données sont correctement formatées
3. Vérifier que `MPNowPlayingInfoCenter` est utilisé
4. Vérifier les logs pour les erreurs

### La synchronisation ne fonctionne pas

1. Vérifier que `setupPlaybackStateListener()` est appelé
2. Vérifier que l'application web émet les événements correctement
3. Vérifier que WebSocket est connecté
4. Vérifier les logs pour les erreurs de communication

## Ressources

- [Apple CarPlay Documentation](https://developer.apple.com/carplay/)
- [CarPlay Programming Guide](https://developer.apple.com/documentation/carplay)
- [MediaPlayer Framework](https://developer.apple.com/documentation/mediaplayer)








