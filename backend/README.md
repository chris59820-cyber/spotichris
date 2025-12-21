# Backend Spotichris

API backend pour l'application de streaming unifiée.

## Installation

```bash
npm install
```

## Configuration

Copiez le fichier `.env.example` vers `.env` et configurez les variables d'environnement :

```bash
cp .env.example .env
```

Variables importantes :
- `PORT` : Port du serveur (défaut: 3000)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` : Configuration PostgreSQL
- `JWT_SECRET`, `JWT_REFRESH_SECRET` : Clés secrètes pour JWT (changez-les en production)

## Base de données

### Prérequis

1. Assurez-vous d'avoir PostgreSQL installé et en cours d'exécution
2. Créez la base de données :
```sql
CREATE DATABASE spotichris;
```

### Initialisation automatique (recommandé)

Pour initialiser la base de données avec le schéma et les données de test :

```bash
npm run db:init
```

Cette commande va :
- Créer toutes les tables nécessaires
- Insérer des données de test (utilisateurs, médias, playlists)

### Initialisation manuelle

Si vous préférez initialiser manuellement :

1. Exécutez les migrations :
```bash
npm run db:migrate
```
ou directement avec psql :
```bash
psql -U postgres -d spotichris -f src/db/migrations/001_initial_schema.sql
```

2. Ajoutez les données de test :
```bash
npm run db:seed
```

### Comptes de test

Après l'initialisation, vous pouvez vous connecter avec :

- **Email:** admin@spotichris.com, **Mot de passe:** password123
- **Email:** user@spotichris.com, **Mot de passe:** password123
- **Email:** demo@spotichris.com, **Mot de passe:** password123

### Données de test incluses

- **Musique:** 11 pistes (rock, électronique, hip-hop, jazz, classique)
- **Vidéo:** 10 contenus (films, séries, documentaires, clips)
- **Playlists:** 4 playlists d'exemple
- **Historique:** Données de lecture et favoris pour l'utilisateur de test

## Démarrage

Mode développement :
```bash
npm run dev
```

Mode production :
```bash
npm run build
npm start
```

## API

L'API sera accessible sur `http://localhost:3000`

Voir `docs/API.md` pour la documentation complète de l'API.

