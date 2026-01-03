# 🚀 Guide de Démarrage - Spotichris

## Structure du Projet

Ce projet est un **monorepo** avec deux parties séparées :
- **Backend** : API Node.js/Express dans `backend/`
- **Frontend** : Application React dans `frontend/`

## ⚠️ Erreur Commune

**Ne pas utiliser** : `node bin/www` (ce fichier n'existe pas)

## ✅ Démarrage Correct

### Option 1 : Démarrage en Mode Développement (Recommandé)

#### Terminal 1 - Backend
```powershell
cd backend
npm install  # Si pas encore fait
npm run dev
```
Le backend sera accessible sur `http://localhost:3000`

#### Terminal 2 - Frontend
```powershell
cd frontend
npm install  # Si pas encore fait
npm run dev
```
Le frontend sera accessible sur `http://localhost:5173`

### Option 2 : Démarrage en Mode Production

#### Backend
```powershell
cd backend
npm install
npm run build  # Compile TypeScript vers JavaScript
npm start      # Lance dist/index.js
```

#### Frontend
```powershell
cd frontend
npm install
npm run build  # Compile le frontend
npm run preview  # Prévisualise la version build
```

## 📋 Scripts Disponibles

### Backend (`backend/package.json`)
- `npm run dev` - Démarrage en mode développement avec hot-reload
- `npm run build` - Compile TypeScript
- `npm start` - Démarre la version compilée (production)
- `npm run db:init` - Initialise la base de données

### Frontend (`frontend/package.json`)
- `npm run dev` - Démarrage en mode développement
- `npm run build` - Compile pour la production
- `npm run preview` - Prévisualise la version build

## 🔧 Prérequis

1. **Node.js 18+** installé
2. **PostgreSQL** installé et en cours d'exécution
3. **Base de données** créée (voir `backend/README.md`)
4. **Fichier `.env`** configuré dans `backend/` (voir `backend/README.md`)

## 📚 Documentation

- `backend/README.md` - Configuration du backend
- `docs/DEPLOYMENT.md` - Guide de déploiement en production
- `docs/API.md` - Documentation de l'API




