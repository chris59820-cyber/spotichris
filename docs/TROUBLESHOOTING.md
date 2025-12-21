# Guide de Dépannage - Spotichris

## Erreur "Erreur lors de la connexion"

Si vous voyez cette erreur lors de la connexion, voici les étapes de dépannage :

### 1. Vérifier que le backend est démarré

**Symptôme :** Erreur "Impossible de se connecter au serveur"

**Solution :**
```bash
cd backend
npm run dev
```

Vous devriez voir :
```
Server is running on port 3000
✅ Connected to PostgreSQL database
```

### 2. Vérifier que la base de données est accessible

**Symptôme :** Erreur de connexion à la base de données

**Vérifications :**
1. PostgreSQL est installé et en cours d'exécution
2. La base de données `spotichris` existe :
```sql
-- Dans psql
\l
-- Cherchez spotichris dans la liste
```

3. Les tables existent :
```sql
-- Dans psql, connectez-vous à la base spotichris
\c spotichris
\dt
-- Vous devriez voir les tables : users, media, playlists, etc.
```

### 3. Initialiser la base de données

Si la base de données n'est pas initialisée :

```bash
cd backend
npm run db:init
```

Cette commande va :
- Créer toutes les tables
- Ajouter les données de test
- Créer les comptes utilisateur de test

### 4. Vérifier les identifiants

Les comptes de test créés par `db:init` sont :
- **Email:** `admin@spotichris.com` / **Mot de passe:** `password123`
- **Email:** `user@spotichris.com` / **Mot de passe:** `password123`
- **Email:** `demo@spotichris.com` / **Mot de passe:** `password123`

### 5. Vérifier les variables d'environnement

Créez un fichier `.env` dans le dossier `backend/` :

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=spotichris
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgres

JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d
```

**Important :** Remplacez `DB_PASSWORD` par votre mot de passe PostgreSQL réel.

### 6. Vérifier la console du navigateur

Ouvrez les outils de développement (F12) et regardez l'onglet Console et Network :

- **Console :** Vérifiez s'il y a des erreurs JavaScript
- **Network :** Vérifiez si la requête vers `/api/auth/login` est faite et quelle est la réponse

### 7. Vérifier CORS

Si vous voyez des erreurs CORS dans la console :

1. Vérifiez que `cors()` est bien configuré dans `backend/src/index.ts`
2. Vérifiez que le proxy est configuré dans `frontend/vite.config.ts`

### 8. Tester l'API directement

Testez l'endpoint de connexion avec curl ou Postman :

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spotichris.com","password":"password123"}'
```

Vous devriez recevoir un JSON avec `token`, `refreshToken` et `user`.

### 9. Vérifier les logs du backend

Regardez les logs dans le terminal où le backend est démarré. Vous devriez voir :
- Les requêtes entrantes
- Les erreurs éventuelles
- Les erreurs de base de données

## Erreurs courantes et solutions

### "Cannot connect to database"
- PostgreSQL n'est pas démarré
- Les identifiants dans `.env` sont incorrects
- La base de données n'existe pas

### "Invalid email or password"
- Les identifiants sont incorrects
- La base de données n'a pas été initialisée avec les données de test
- Le hash du mot de passe dans la base est incorrect

### "Network Error" ou "ERR_CONNECTION_REFUSED"
- Le backend n'est pas démarré
- Le backend écoute sur un autre port
- Le proxy Vite n'est pas configuré correctement

### "CORS policy"
- Le middleware CORS n'est pas activé
- Les headers CORS sont incorrects

## Commandes utiles

```bash
# Vérifier que PostgreSQL est en cours d'exécution
# Windows
Get-Service -Name postgresql*

# Linux/Mac
sudo systemctl status postgresql

# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE spotichris;

# Réinitialiser complètement la base de données
DROP DATABASE spotichris;
CREATE DATABASE spotichris;
cd backend
npm run db:init
```

## Obtenir de l'aide

Si le problème persiste :
1. Vérifiez les logs du backend
2. Vérifiez la console du navigateur
3. Vérifiez que tous les services sont démarrés
4. Vérifiez la configuration de la base de données

