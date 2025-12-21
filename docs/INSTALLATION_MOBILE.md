# Installation des Applications Mobiles

Ce guide explique comment installer et configurer les applications natives iOS et Android pour Spotichris.

## Vue d'ensemble

Les applications natives servent de pont entre l'application web React et les systèmes automobiles (CarPlay et Android Auto). Elles chargent l'application web via WebView et synchronisent l'état de lecture.

## Application iOS (CarPlay)

### Prérequis

- **Xcode 12+** (recommandé: dernière version)
- **iOS 14+** comme version cible
- **Compte développeur Apple** avec accès CarPlay (99$/an)
- **CocoaPods** (pour gérer les dépendances, si nécessaire)

### Installation

1. **Ouvrir le projet dans Xcode** :
```bash
cd mobile/ios
open Spotichris.xcworkspace
```

Si le fichier `.xcworkspace` n'existe pas encore, créez un nouveau projet Xcode :
- Créez un nouveau projet iOS dans Xcode
- Sélectionnez "App" comme template
- Nommez-le "Spotichris"
- Placez les fichiers Swift dans le projet

2. **Installer les dépendances** (si nécessaire) :
```bash
pod install
```

3. **Configurer le Bundle Identifier** :
   - Ouvrez le projet dans Xcode
   - Sélectionnez le target "Spotichris"
   - Allez dans "Signing & Capabilities"
   - Configurez votre Bundle Identifier (ex: `com.spotichris.app`)

4. **Activer CarPlay** :
   - Dans "Signing & Capabilities", cliquez sur "+ Capability"
   - Ajoutez "CarPlay"
   - Sélectionnez "Media App" comme type d'application CarPlay

5. **Configurer l'URL de l'application web** :
   - Ouvrez `MainViewController.swift`
   - Modifiez la constante `webAppURL` :
   ```swift
   private let webAppURL = "http://votre-serveur:5173" // URL de production
   ```

6. **Compiler et lancer** :
   - Sélectionnez un simulateur ou un appareil iOS
   - Appuyez sur Cmd+R pour compiler et lancer

### Tester CarPlay

1. **Simulateur CarPlay** :
   - Dans Xcode, allez dans "Window" > "Devices and Simulators"
   - Créez un simulateur CarPlay
   - Lancez l'application et connectez-vous au simulateur

2. **Appareil réel** :
   - Connectez un iPhone à un système CarPlay compatible
   - L'application devrait apparaître automatiquement dans CarPlay

## Application Android (Android Auto)

### Prérequis

- **Android Studio** (dernière version recommandée)
- **Android SDK 21+** (Android 5.0+)
- **Google Play Services** installé
- **Appareil Android** ou **Émulateur** pour tester

### Installation

1. **Ouvrir le projet dans Android Studio** :
```bash
cd mobile/android
# Ouvrir Android Studio et sélectionner "Open an existing project"
# Naviguer vers le dossier mobile/android
```

2. **Synchroniser Gradle** :
   - Android Studio devrait synchroniser automatiquement
   - Si ce n'est pas le cas, cliquez sur "Sync Project with Gradle Files"

3. **Configurer l'Application ID** :
   - Ouvrez `app/build.gradle`
   - Modifiez `applicationId` si nécessaire :
   ```gradle
   defaultConfig {
       applicationId "com.spotichris"
       // ...
   }
   ```

4. **Configurer l'URL de l'application web** :
   - Ouvrez `MainActivity.kt`
   - Modifiez la constante `webAppURL` :
   ```kotlin
   private val webAppURL = "http://votre-serveur:5173" // URL de production
   ```

5. **Compiler et installer** :
   - Connectez un appareil Android ou lancez un émulateur
   - Cliquez sur "Run" (▶) dans Android Studio

### Tester Android Auto

1. **Appareil réel** :
   - Installez l'application sur un appareil Android
   - Connectez l'appareil à un système Android Auto compatible
   - L'application devrait apparaître dans Android Auto

2. **Émulateur** :
   - Android Auto nécessite généralement un appareil réel
   - Certains émulateurs peuvent fonctionner avec des configurations spéciales

## Configuration de Production

### iOS

1. **Certificats et Profils** :
   - Créez un certificat de distribution dans le Developer Portal
   - Créez un profil de provisioning pour CarPlay
   - Configurez dans Xcode > Signing & Capabilities

2. **URL de Production** :
   - Modifiez `webAppURL` dans `MainViewController.swift`
   - Utilisez HTTPS en production

3. **App Transport Security** :
   - L'Info.plist est déjà configuré pour permettre les connexions locales
   - Pour la production, configurez les domaines autorisés

### Android

1. **Signature de l'application** :
   - Créez un keystore pour signer l'application
   - Configurez dans `app/build.gradle` :
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file('path/to/keystore.jks')
               storePassword 'password'
               keyAlias 'key'
               keyPassword 'password'
           }
       }
   }
   ```

2. **URL de Production** :
   - Modifiez `webAppURL` dans `MainActivity.kt`
   - Utilisez HTTPS en production

3. **Permissions** :
   - Les permissions nécessaires sont déjà déclarées dans `AndroidManifest.xml`

## Dépannage

### iOS

- **CarPlay ne s'affiche pas** : Vérifiez que CarPlay est activé dans les Capabilities et que vous avez un compte développeur valide
- **WebView ne charge pas** : Vérifiez l'URL et les paramètres App Transport Security
- **Commandes ne fonctionnent pas** : Vérifiez que `MainViewController` est correctement référencé dans `CarPlayManager`

### Android

- **Android Auto ne détecte pas l'app** : Vérifiez que `MediaBrowserService` est déclaré dans le manifest et que les métadonnées Android Auto sont présentes
- **WebView ne charge pas** : Vérifiez l'URL et les permissions Internet
- **Commandes ne fonctionnent pas** : Vérifiez que `MainActivity` est correctement référencée dans `MediaBrowserService`

## Prochaines Étapes

Une fois les applications installées et testées :

1. Implémenter la synchronisation WebSocket pour la communication temps réel
2. Ajouter la navigation dans les bibliothèques depuis CarPlay/Android Auto
3. Implémenter la file d'attente de lecture
4. Ajouter la recherche vocale

Voir `docs/CARPLAY_ANDROID_AUTO.md` pour plus de détails sur l'architecture.

