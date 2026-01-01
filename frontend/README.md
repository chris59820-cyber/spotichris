# Frontend Spotichris

Application React + TypeScript pour l'application de streaming unifiée.

## Installation

```bash
npm install
```

## Démarrage

Mode développement :
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Build

Pour créer une build de production :

```bash
npm run build
```

Les fichiers compilés seront dans le dossier `dist/`.

## Prévisualisation

Pour prévisualiser la build de production :

```bash
npm run preview
```

## Technologies

- **React 18+** : Bibliothèque UI
- **TypeScript** : Typage statique
- **Vite** : Build tool et dev server
- **React Router** : Routing
- **Axios** : Client HTTP

## Structure

```
src/
├── components/      # Composants réutilisables
│   ├── layout/      # Layout (Header, Sidebar, PlayerBar)
│   ├── player/      # Lecteurs (Audio, Video)
│   └── ui/          # Composants UI de base
├── features/        # Fonctionnalités par domaine
│   ├── auth/        # Authentification
│   └── search/      # Recherche
├── pages/           # Pages de l'application
├── hooks/           # Hooks React personnalisés
├── services/        # Services API
├── styles/          # Styles globaux et thème
└── utils/           # Utilitaires
```

## Design

L'application utilise un thème cyberpunk avec support du mode sombre. Les couleurs principales sont définies dans `src/styles/theme.ts`.






