# Application Android Spotichris avec Android Auto

## Prérequis

- Android Studio
- Android SDK 21+
- Google Play Services

## Installation

1. Ouvrir le projet dans Android Studio :
```bash
cd mobile/android
# Ouvrir le dossier dans Android Studio
```

2. Synchroniser Gradle (Android Studio le fait automatiquement)

3. Configurer l'application ID dans `app/build.gradle`

## Configuration Android Auto

1. L'application est déjà configurée dans `AndroidManifest.xml`
2. Le service `MediaBrowserService` est déclaré
3. Les métadonnées Android Auto sont dans `res/xml/automotive_app_desc.xml`

## Structure du projet

```
app/
├── src/main/
│   ├── java/com/spotichris/
│   │   ├── MainActivity.kt          # Activité principale avec WebView
│   │   └── MediaBrowserService.kt   # Service pour Android Auto
│   ├── res/
│   │   ├── layout/
│   │   │   └── activity_main.xml    # Layout avec WebView
│   │   ├── values/
│   │   │   └── strings.xml          # Ressources
│   │   └── xml/
│   │       └── automotive_app_desc.xml  # Configuration Android Auto
│   └── AndroidManifest.xml         # Manifest avec service Android Auto
└── build.gradle                     # Configuration Gradle
```

## Développement

L'application charge l'application web React via WebView et synchronise l'état de lecture avec Android Auto via MediaSession.

### Tester Android Auto

1. Installer l'application sur un appareil Android
2. Connecter l'appareil à un système Android Auto compatible
3. L'application devrait apparaître dans Android Auto

## Notes

- L'URL de l'application web est configurée dans `MainActivity.kt` (par défaut: `http://localhost:5173`)
- Pour la production, changer l'URL vers l'URL de production
- Android Auto nécessite une certification Google
- Le service `MediaBrowserService` doit être déclaré dans le manifest

## Dépendances

- `androidx.media3:media3-session` - Pour Android Auto
- `androidx.appcompat:appcompat` - Support des fonctionnalités Android modernes







