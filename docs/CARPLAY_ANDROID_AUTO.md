# Compatibilité CarPlay et Android Auto

Ce document décrit l'implémentation de la compatibilité CarPlay (iOS) et Android Auto pour Spotichris.

## Vue d'ensemble

Pour supporter CarPlay et Android Auto, nous devons créer des applications natives qui agissent comme des ponts entre l'application web et les systèmes automobiles.

## Architecture proposée

### Option 1 : Applications natives avec WebView (Recommandée)

Créer des applications iOS et Android natives qui :
- Utilisent WebView pour charger l'application web React
- Implémentent les interfaces CarPlay/Android Auto
- Synchronisent l'état de lecture avec l'application web

### Option 2 : Progressive Web App (PWA) avec Media Session API

Utiliser l'API Media Session pour exposer les contrôles média aux systèmes automobiles via le navigateur.

## Structure du projet

```
spotichris/
├── mobile/
│   ├── ios/              # Application iOS native
│   │   ├── Spotichris/
│   │   │   ├── AppDelegate.swift
│   │   │   ├── SceneDelegate.swift
│   │   │   ├── CarPlay/
│   │   │   │   ├── CarPlaySceneDelegate.swift
│   │   │   │   └── CarPlayManager.swift
│   │   │   └── Info.plist
│   │   └── Podfile
│   └── android/          # Application Android native
│       ├── app/
│       │   ├── src/main/
│       │   │   ├── java/com/spotichris/
│       │   │   │   ├── MainActivity.kt
│       │   │   │   └── MediaBrowserService.kt
│       │   │   └── AndroidManifest.xml
│       │   └── build.gradle
│       └── build.gradle
```

## Implémentation iOS (CarPlay)

### Prérequis

1. Compte développeur Apple avec accès CarPlay
2. Xcode 12+
3. iOS 14+

### Configuration

1. **Info.plist**
```xml
<key>UISupportsCarPlay</key>
<true/>
<key>UIApplicationSceneManifest</key>
<dict>
    <key>UIApplicationSupportsMultipleScenes</key>
    <true/>
    <key>UISceneConfigurations</key>
    <dict>
        <key>CPTemplateApplicationSceneSessionRoleApplication</key>
        <array>
            <dict>
                <key>UISceneConfigurationName</key>
                <string>CarPlayScene</string>
                <key>UISceneDelegateClassName</key>
                <string>$(PRODUCT_MODULE_NAME).CarPlaySceneDelegate</string>
            </dict>
        </array>
    </dict>
</dict>
```

2. **CarPlayManager.swift**
```swift
import CarPlay
import MediaPlayer

class CarPlayManager: NSObject, CPApplicationDelegate {
    var interfaceController: CPInterfaceController?
    
    func application(_ application: UIApplication, 
                     didConnectCarInterfaceController interfaceController: CPInterfaceController,
                     to window: CPWindow) {
        self.interfaceController = interfaceController
        
        // Créer le template principal
        let template = createNowPlayingTemplate()
        interfaceController.setRootTemplate(template, animated: true)
    }
    
    func createNowPlayingTemplate() -> CPNowPlayingTemplate {
        let template = CPNowPlayingTemplate.shared
        return template
    }
}
```

3. **Intégration avec l'application web**
- Utiliser WKWebView pour charger l'application React
- Écouter les événements de lecture via JavaScript
- Synchroniser avec CarPlay via MediaPlayer framework

## Implémentation Android (Android Auto)

### Prérequis

1. Android Studio
2. Android SDK 21+
3. Google Play Services

### Configuration

1. **AndroidManifest.xml**
```xml
<application>
    <service
        android:name=".MediaBrowserService"
        android:exported="true">
        <intent-filter>
            <action android:name="android.media.browse.MediaBrowserService" />
        </intent-filter>
    </service>
    
    <meta-data
        android:name="com.google.android.gms.car.application"
        android:resource="@xml/automotive_app_desc" />
</application>
```

2. **MediaBrowserService.kt**
```kotlin
class MediaBrowserService : MediaBrowserServiceCompat() {
    override fun onGetRoot(
        clientPackageName: String,
        clientUid: Int,
        rootHints: Bundle?
    ): BrowserRoot? {
        return BrowserRoot("root", null)
    }
    
    override fun onLoadChildren(
        parentId: String,
        result: Result<List<MediaBrowserCompat.MediaItem>>
    ) {
        // Charger la liste des médias depuis l'API
        val mediaItems = loadMediaItems()
        result.sendResult(mediaItems)
    }
}
```

3. **Intégration avec l'application web**
- Utiliser WebView pour charger l'application React
- Synchroniser l'état de lecture via JavaScript Bridge
- Exposer les métadonnées média à Android Auto

## API Backend - Endpoints nécessaires

### Endpoints pour CarPlay/Android Auto

1. **GET /api/media/now-playing**
   - Retourne le média actuellement en lecture
   - Format simplifié pour les systèmes automobiles

2. **GET /api/media/queue**
   - Retourne la file d'attente de lecture
   - Format compatible avec les standards automobiles

3. **POST /api/player/control**
   - Contrôle la lecture (play, pause, next, previous)
   - Accepte les commandes depuis CarPlay/Android Auto

## Synchronisation avec l'application web

### WebSocket ou Server-Sent Events

Pour synchroniser l'état entre l'application web et les apps natives :

```typescript
// frontend/src/services/carplay.service.ts
export class CarPlayService {
  private ws: WebSocket
  
  connect() {
    this.ws = new WebSocket('ws://localhost:3000/carplay')
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      // Synchroniser l'état de lecture
    }
  }
  
  sendCommand(command: 'play' | 'pause' | 'next' | 'previous') {
    this.ws.send(JSON.stringify({ command }))
  }
}
```

## État actuel de l'implémentation

### ✅ Fait

1. **Backend**
   - [x] Routes API CarPlay/Android Auto (`/api/carplay/*`)
   - [x] Endpoints pour now-playing, queue, et control
   - [x] Documentation de l'architecture

2. **Frontend**
   - [x] Service CarPlay (`carplay.service.ts`)
   - [x] Intégration avec PlayerContext
   - [x] Synchronisation de l'état de lecture

3. **Applications Natives**
   - [x] Structure complète iOS avec CarPlay
   - [x] Structure complète Android avec Android Auto
   - [x] WebView intégrée pour charger l'application React
   - [x] CarPlayManager avec support MediaPlayer
   - [x] MediaBrowserService pour Android Auto
   - [x] Configuration Info.plist et AndroidManifest.xml
   - [x] Documentation d'installation et de développement

### ⏳ Prochaines étapes

1. **Phase 1 : Tests et Intégration**
   - [ ] Tester l'application iOS sur simulateur CarPlay
   - [ ] Tester l'application Android sur appareil Android Auto
   - [ ] Vérifier la synchronisation WebView ↔ CarPlay/Android Auto
   - [ ] Ajuster les URLs de production

2. **Phase 2 : WebSocket Backend**
   - [ ] Implémenter WebSocket server (socket.io ou ws)
   - [ ] Gérer les connexions CarPlay/Android Auto
   - [ ] Synchronisation temps réel bidirectionnelle
   - [ ] Tester la synchronisation en temps réel

3. **Phase 3 : Améliorations**
   - [ ] File d'attente de lecture
   - [ ] Navigation dans les bibliothèques depuis CarPlay/Android Auto
   - [ ] Recherche vocale
   - [ ] Notifications push

## Notes importantes

- CarPlay nécessite un compte développeur Apple payant
- Android Auto nécessite une certification Google
- Les deux systèmes ont des restrictions sur les types de contenu
- La synchronisation en temps réel nécessite une connexion réseau stable

## Ressources

- [Apple CarPlay Documentation](https://developer.apple.com/carplay/)
- [Android Auto Documentation](https://developer.android.com/training/cars/media)
- [Media Session API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API)

