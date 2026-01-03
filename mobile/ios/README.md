# Application iOS Spotichris avec CarPlay

## Prérequis

- Xcode 12+
- iOS 14+
- Compte développeur Apple avec accès CarPlay (99$/an)

## Installation

1. Ouvrir le projet dans Xcode :
```bash
cd mobile/ios
open Spotichris.xcworkspace
```

2. Installer les dépendances (si nécessaire) :
```bash
pod install
```

3. Configurer le Bundle Identifier dans les paramètres du projet

4. Configurer le compte développeur dans Signing & Capabilities

## Configuration CarPlay

1. Dans Xcode, aller dans **Signing & Capabilities**
2. Ajouter la capability **CarPlay**
3. Sélectionner le type d'application CarPlay (Media App)

## Structure du projet

```
Spotichris/
├── AppDelegate.swift          # Point d'entrée de l'application
├── SceneDelegate.swift        # Gestion des scènes iOS
├── MainViewController.swift   # Vue principale avec WebView
├── CarPlay/
│   ├── CarPlaySceneDelegate.swift  # Gestion de la scène CarPlay
│   └── CarPlayManager.swift        # Gestion des templates CarPlay
└── Info.plist                 # Configuration (CarPlay activé)
```

## Développement

L'application charge l'application web React via WebView et synchronise l'état de lecture avec CarPlay via le MediaPlayer framework.

### Tester CarPlay

1. Connecter un iPhone à un simulateur CarPlay ou à un appareil compatible
2. Lancer l'application
3. CarPlay devrait se connecter automatiquement

## Notes

- L'URL de l'application web est configurée dans `MainViewController.swift` (par défaut: `http://localhost:5173`)
- Pour la production, changer l'URL vers l'URL de production
- CarPlay nécessite une certification Apple








