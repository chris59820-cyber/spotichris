# Architecture de l'Application

## Vue d'ensemble

L'application Spotichris suit une architecture en couches séparant clairement le frontend, le backend et les données partagées.

## Architecture Frontend

### Structure

```
frontend/
├── src/
│   ├── components/      # Composants réutilisables
│   │   ├── layout/      # Composants de layout (Header, Sidebar, etc.)
│   │   ├── player/      # Composants de lecture (Audio, Video)
│   │   └── ui/          # Composants UI de base (Button, Input, etc.)
│   ├── features/        # Fonctionnalités par domaine
│   │   ├── auth/        # Authentification
│   │   └── search/      # Recherche
│   ├── pages/           # Pages de l'application
│   ├── hooks/           # Hooks React personnalisés
│   ├── services/        # Services API
│   ├── styles/          # Styles globaux et thème
│   └── utils/           # Utilitaires
```

### Technologies

- **React 18+** : Bibliothèque UI
- **TypeScript** : Typage statique
- **Vite** : Build tool et dev server
- **React Router** : Routing
- **Context API** : Gestion d'état global (auth, player)

## Architecture Backend

### Structure

```
backend/
├── src/
│   ├── controllers/     # Contrôleurs des routes
│   ├── services/        # Logique métier
│   ├── models/          # Modèles de données
│   ├── middleware/      # Middleware Express
│   ├── routes/          # Définition des routes
│   ├── config/          # Configuration
│   └── utils/           # Utilitaires
```

### Technologies

- **Node.js** : Runtime JavaScript
- **Express** : Framework web
- **TypeScript** : Typage statique
- **PostgreSQL** : Base de données relationnelle
- **JWT** : Authentification

## Base de Données

### Schémas Principaux

- **Users** : Utilisateurs et profils
- **Media** : Contenus (musique et vidéo)
- **Playlists** : Playlists utilisateur
- **UserMedia** : Relations utilisateur-contenu (favoris, historique, téléchargements)
- **Sessions** : Sessions d'écoute/visionnage

## Flux de Données

1. **Authentification** : L'utilisateur s'authentifie via le frontend qui communique avec l'API backend
2. **Requêtes API** : Le frontend fait des appels REST à l'API backend
3. **Base de données** : Le backend interroge PostgreSQL pour récupérer/manipuler les données
4. **Cache** : Redis peut être utilisé pour mettre en cache les données fréquemment accédées
5. **Streaming** : Les médias sont servis via des URLs générées par le backend (intégration future avec services cloud)







