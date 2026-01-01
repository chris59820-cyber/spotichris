# Configuration de la Base de Données

Ce guide vous explique comment configurer et initialiser la base de données PostgreSQL pour Spotichris.

## Prérequis

- PostgreSQL 14+ installé et en cours d'exécution
- Node.js 18+ installé
- Accès à la base de données PostgreSQL avec les privilèges nécessaires

## Étapes d'Installation

### 1. Créer la Base de Données

Connectez-vous à PostgreSQL et créez la base de données :

```bash
psql -U postgres
```

Puis dans le terminal PostgreSQL :

```sql
CREATE DATABASE spotichris;
\q
```

### 2. Configurer les Variables d'Environnement

Copiez le fichier `.env.example` vers `.env` dans le dossier `backend/` :

```bash
cd backend
cp .env.example .env
```

Éditez le fichier `.env` et configurez les paramètres de connexion :

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spotichris
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
```

### 3. Initialiser la Base de Données

#### Option A : Initialisation Automatique (Recommandé)

Cette méthode exécute à la fois les migrations et le seed :

```bash
npm run db:init
```

#### Option B : Initialisation Manuelle

Si vous préférez exécuter les étapes séparément :

1. **Exécuter les migrations** (créer les tables) :
```bash
npm run db:migrate
```
ou directement avec psql :
```bash
psql -U postgres -d spotichris -f src/db/migrations/001_initial_schema.sql
```

2. **Ajouter les données de test** :
```bash
npm run db:seed
```

### 4. Vérifier l'Installation

Vous pouvez vérifier que tout fonctionne en testant la connexion :

```bash
npm run dev
```

Le serveur devrait démarrer sans erreur et afficher un message de connexion à la base de données.

## Données de Test

Après l'initialisation, vous aurez accès à :

### Comptes Utilisateur de Test

- **Email:** admin@spotichris.com
- **Mot de passe:** password123

- **Email:** user@spotichris.com
- **Mot de passe:** password123

- **Email:** demo@spotichris.com
- **Mot de passe:** password123

### Contenus de Test

- **11 pistes musicales** (rock, électronique, hip-hop, jazz, classique)
- **10 contenus vidéo** (films, séries, documentaires, clips)
- **4 playlists** d'exemple
- **Historique et favoris** pour l'utilisateur de test

## Générer un Hash Bcrypt

Pour générer un nouveau hash bcrypt pour un mot de passe :

```bash
npm run db:hash <votre_mot_de_passe>
```

Exemple :
```bash
npm run db:hash monNouveauMotDePasse
```

## Résolution de Problèmes

### Erreur de Connexion

Si vous obtenez une erreur de connexion, vérifiez :

1. PostgreSQL est bien démarré
2. Les variables d'environnement sont correctement configurées
3. L'utilisateur PostgreSQL a les droits nécessaires
4. La base de données `spotichris` existe

### Erreur "Relation already exists"

Si vous obtenez cette erreur, les tables existent déjà. Vous pouvez :

1. Supprimer et recréer la base de données :
```sql
DROP DATABASE spotichris;
CREATE DATABASE spotichris;
```

2. Ou simplement ignorer cette erreur si vous voulez juste ajouter des données

### Réinitialiser la Base de Données

Pour tout réinitialiser depuis le début :

```sql
DROP DATABASE spotichris;
CREATE DATABASE spotichris;
```

Puis réexécutez `npm run db:init`






