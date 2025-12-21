# Spotichris - Application de Streaming Unifiée

Application de streaming multimédia fusionnant les fonctionnalités de Netflix (vidéo) et Spotify (musique) au sein d'une plateforme unifiée.

## 🚀 Technologies

- **Frontend**: React 18+ avec TypeScript, Vite
- **Backend**: Node.js avec Express
- **Base de données**: PostgreSQL + Redis
- **Authentification**: JWT avec support 2FA

## 📁 Structure du Projet

```
spotichris/
├── frontend/          # Application React + TypeScript
├── backend/           # API Node.js
├── shared/            # Types et utilitaires partagés
└── docs/              # Documentation
```

## 🛠️ Installation

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- Redis (optionnel pour le cache)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install

# Configuration de la base de données
# 1. Assurez-vous que PostgreSQL est installé et en cours d'exécution
# 2. Créez la base de données: CREATE DATABASE spotichris;
# 3. Configurez les variables d'environnement (copiez .env.example vers .env)
# 4. Initialisez la base de données avec les données de test:
npm run db:init

# Lancez le serveur
npm run dev
```

**Note:** Les données de test incluent des comptes utilisateur (voir `backend/README.md` pour les identifiants).

## 📚 Documentation

Voir le dossier `docs/` pour plus de détails sur l'architecture et l'API.

## 🎨 Design

L'application utilise un design moderne de type cyberpunk avec support du mode sombre et clair.

## 📝 License

Propriétaire
