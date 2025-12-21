# Applications Mobiles Spotichris

Ce dossier contient les applications natives iOS et Android pour supporter CarPlay et Android Auto.

## Structure

```
mobile/
├── ios/          # Application iOS avec support CarPlay
│   ├── Spotichris/
│   │   ├── AppDelegate.swift
│   │   ├── SceneDelegate.swift
│   │   ├── MainViewController.swift
│   │   ├── CarPlay/
│   │   │   ├── CarPlaySceneDelegate.swift
│   │   │   └── CarPlayManager.swift
│   │   └── Info.plist
│   └── Podfile
└── android/       # Application Android avec support Android Auto
    ├── app/
    │   └── src/main/
    │       ├── java/com/spotichris/
    │       │   ├── MainActivity.kt
    │       │   └── MediaBrowserService.kt
    │       ├── res/
    │       └── AndroidManifest.xml
    └── build.gradle
```

## Prérequis

### iOS
- Xcode 12+
- iOS 14+
- Compte développeur Apple avec accès CarPlay (99$/an)

### Android
- Android Studio
- Android SDK 21+
- Google Play Services

## Installation

### iOS
```bash
cd mobile/ios
pod install
open Spotichris.xcworkspace
```

Voir `mobile/ios/README.md` pour plus de détails.

### Android
```bash
cd mobile/android
# Ouvrir dans Android Studio
```

Voir `mobile/android/README.md` pour plus de détails.

## Développement

Les applications natives chargent l'application web React via WebView et synchronisent l'état de lecture avec CarPlay/Android Auto.

### Fonctionnalités

- **WebView** : Charge l'application web React
- **Synchronisation** : État de lecture synchronisé avec CarPlay/Android Auto
- **Commandes** : Contrôles média depuis les systèmes automobiles
- **Métadonnées** : Affichage des informations du média en cours

Voir `docs/CARPLAY_ANDROID_AUTO.md` pour plus de détails sur l'architecture.

