# Test de la Synchronisation entre l'Application Web et les Systèmes Automobiles

Ce document décrit comment tester la synchronisation entre l'application web Spotichris et les systèmes automobiles (CarPlay et Android Auto).

## Vue d'ensemble

La synchronisation fonctionne via WebSocket :
- **Application Web** → WebSocket → **Backend** → WebSocket → **Applications Natives (CarPlay/Android Auto)**
- **Applications Natives** → WebSocket → **Backend** → WebSocket → **Application Web**

## Prérequis

1. **Backend en cours d'exécution** :
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend en cours d'exécution** :
   ```bash
   cd frontend
   npm run dev
   ```

3. **Base de données configurée** avec au moins un média de test

4. **Utilisateur connecté** dans l'application web

## Méthode 1 : Test via la Page WebSocket Test

### Étape 1 : Accéder à la page de test

1. Ouvrir l'application web dans le navigateur : `http://localhost:5173`
2. Se connecter avec un compte utilisateur
3. Naviguer vers la page "Test WebSocket" dans la sidebar

### Étape 2 : Vérifier la connexion

1. Vérifier que le statut affiche "Connecté ✅"
2. Si "Déconnecté ❌", vérifier :
   - Le backend est en cours d'exécution
   - Le token JWT est valide
   - Les logs du backend pour les erreurs

### Étape 3 : Tester l'envoi d'état de lecture

1. Lancer la lecture d'un média dans l'application web
2. Cliquer sur "Envoyer état de lecture"
3. Vérifier dans les logs :
   - Le message "Sent state: ..." apparaît
   - Le backend reçoit l'état

### Étape 4 : Tester les commandes

1. Cliquer sur "Envoyer Commande: Play"
2. Vérifier que la lecture démarre dans l'application web
3. Répéter pour "Pause", "Next", "Previous", "Seek"

## Méthode 2 : Test avec CarPlay (iOS)

### Prérequis

1. **Xcode installé** avec un simulateur iOS
2. **Application iOS compilée** dans `mobile/ios/`
3. **Simulateur CarPlay** configuré dans Xcode

### Étape 1 : Lancer l'application iOS

1. Ouvrir `mobile/ios/Spotichris.xcworkspace` dans Xcode
2. Sélectionner un simulateur iOS
3. Lancer l'application (⌘R)

### Étape 2 : Connecter CarPlay

1. Dans Xcode, aller dans "Window" > "Devices and Simulators"
2. Créer un simulateur CarPlay
3. Lancer le simulateur CarPlay
4. L'application Spotichris devrait apparaître dans CarPlay

### Étape 3 : Tester la synchronisation

1. **Depuis l'application web** :
   - Lancer la lecture d'un média
   - Vérifier que les métadonnées apparaissent dans CarPlay
   - Vérifier que l'état de lecture est synchronisé

2. **Depuis CarPlay** :
   - Appuyer sur "Play" dans CarPlay
   - Vérifier que la lecture démarre dans l'application web
   - Appuyer sur "Pause"
   - Vérifier que la lecture s'arrête dans l'application web
   - Utiliser "Next" et "Previous"
   - Vérifier que les médias changent dans l'application web

### Étape 4 : Vérifier les logs

1. Dans Xcode, vérifier les logs de l'application iOS :
   - "✅ CarPlay connecté"
   - "📡 État de lecture reçu: ..."
   - "➡️ Commande envoyée: ..."

2. Dans la console du backend :
   - "Socket connected: ..."
   - "User X playback state updated: ..."
   - "User X received command: ..."

## Méthode 3 : Test avec Android Auto

### Prérequis

1. **Android Studio installé**
2. **Application Android compilée** dans `mobile/android/`
3. **Appareil Android réel** ou émulateur avec Android Auto

### Étape 1 : Lancer l'application Android

1. Ouvrir `mobile/android/` dans Android Studio
2. Synchroniser Gradle
3. Lancer l'application sur un appareil/émulateur

### Étape 2 : Connecter Android Auto

1. **Sur un appareil réel** :
   - Connecter l'appareil à un système Android Auto compatible
   - L'application Spotichris devrait apparaître dans Android Auto

2. **Sur un émulateur** :
   - Utiliser Android Auto Desktop Head Unit (DHU)
   - Suivre les instructions de la documentation Android Auto

### Étape 3 : Tester la synchronisation

1. **Depuis l'application web** :
   - Lancer la lecture d'un média
   - Vérifier que les métadonnées apparaissent dans Android Auto
   - Vérifier que l'état de lecture est synchronisé

2. **Depuis Android Auto** :
   - Appuyer sur "Play" dans Android Auto
   - Vérifier que la lecture démarre dans l'application web
   - Appuyer sur "Pause"
   - Vérifier que la lecture s'arrête dans l'application web
   - Utiliser "Next" et "Previous"
   - Vérifier que les médias changent dans l'application web

### Étape 4 : Vérifier les logs

1. Dans Android Studio, vérifier les logs de l'application :
   - "✅ MediaBrowserService créé"
   - "📡 État de lecture reçu: ..."
   - "➡️ Commande envoyée: ..."

2. Dans la console du backend :
   - "Socket connected: ..."
   - "User X playback state updated: ..."
   - "User X received command: ..."

## Méthode 4 : Test avec Script Backend

### Utiliser le script de test WebSocket

```bash
cd backend
npm run test:websocket
```

**Note** : Vous devez d'abord configurer `TEST_TOKEN` dans `.env` avec un JWT valide.

## Vérifications à Effectuer

### ✅ Connexion WebSocket

- [ ] Le frontend se connecte au WebSocket
- [ ] Le backend accepte la connexion
- [ ] L'authentification JWT fonctionne
- [ ] Les applications natives se connectent (si disponibles)

### ✅ Synchronisation État → Systèmes Automobiles

- [ ] Quand la lecture démarre dans l'application web, CarPlay/Android Auto affiche les métadonnées
- [ ] Quand la lecture est mise en pause, CarPlay/Android Auto reflète l'état
- [ ] Quand le temps de lecture change, CarPlay/Android Auto met à jour la position
- [ ] Quand le média change, CarPlay/Android Auto affiche les nouvelles métadonnées

### ✅ Synchronisation Commandes → Application Web

- [ ] Quand "Play" est pressé dans CarPlay/Android Auto, la lecture démarre dans l'application web
- [ ] Quand "Pause" est pressé, la lecture s'arrête dans l'application web
- [ ] Quand "Next" est pressé, le média suivant est joué dans l'application web
- [ ] Quand "Previous" est pressé, le média précédent est joué dans l'application web
- [ ] Quand "Seek" est utilisé, la position change dans l'application web

### ✅ Métadonnées

- [ ] Le titre du média s'affiche correctement
- [ ] L'artiste s'affiche correctement
- [ ] L'album s'affiche correctement
- [ ] La durée s'affiche correctement
- [ ] L'artwork s'affiche correctement (si disponible)

### ✅ Performance

- [ ] La latence de synchronisation est acceptable (< 1 seconde)
- [ ] Pas de déconnexions inattendues
- [ ] La reconnexion automatique fonctionne

## Dépannage

### Le WebSocket ne se connecte pas

1. **Vérifier le backend** :
   ```bash
   # Vérifier que le serveur écoute sur le bon port
   netstat -an | grep 3000
   ```

2. **Vérifier les logs du backend** :
   - Rechercher les erreurs de connexion
   - Vérifier l'authentification JWT

3. **Vérifier le frontend** :
   - Ouvrir la console du navigateur (F12)
   - Rechercher les erreurs WebSocket
   - Vérifier que le token JWT est valide

### La synchronisation ne fonctionne pas

1. **Vérifier que les deux clients sont connectés** :
   - Application web connectée
   - Application native connectée (CarPlay/Android Auto)

2. **Vérifier les logs** :
   - Backend : Vérifier que les messages sont reçus et émis
   - Frontend : Vérifier que les messages sont envoyés et reçus
   - Applications natives : Vérifier que les messages sont reçus

3. **Vérifier le format des messages** :
   - Les messages doivent être au format JSON valide
   - Les champs requis doivent être présents

### Les métadonnées ne s'affichent pas

1. **Vérifier que `updateMetadata()` est appelé** :
   - Dans CarPlay : `CarPlayManager.updateNowPlayingInfo()`
   - Dans Android Auto : `MediaBrowserService.updateMetadata()`

2. **Vérifier le format des métadonnées** :
   - Les champs requis doivent être présents
   - Les types de données doivent être corrects

3. **Vérifier les logs** :
   - Rechercher les erreurs de mise à jour des métadonnées

## Outils de Debug

### Console du Navigateur

Ouvrir la console (F12) et vérifier :
- Les messages WebSocket
- Les erreurs JavaScript
- Les logs de `carPlayService`

### Logs Backend

Vérifier les logs du serveur :
- Connexions/déconnexions WebSocket
- Messages reçus/émis
- Erreurs d'authentification

### Logs Applications Natives

- **iOS** : Xcode Console
- **Android** : Android Studio Logcat

## Prochaines Étapes

Après avoir vérifié que la synchronisation fonctionne :

1. **Tester avec plusieurs clients** simultanément
2. **Tester la reconnexion** après une déconnexion
3. **Tester avec différents types de médias** (audio, vidéo)
4. **Tester les performances** avec de nombreux médias
5. **Tester en conditions réelles** (voiture, connexion réseau variable)

## Ressources

- [Documentation WebSocket](docs/WEBSOCKET.md)
- [Documentation CarPlay](mobile/ios/CONFIGURATION_CARPLAY.md)
- [Documentation Android Auto](mobile/android/CONFIGURATION_ANDROID_AUTO.md)
- [Documentation Test WebSocket](docs/TESTING_WEBSOCKET.md)

