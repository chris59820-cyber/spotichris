# Guide de Déploiement en Production - Spotichris

Ce guide vous explique comment déployer l'application Spotichris sur un serveur de production.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Préparation du serveur](#préparation-du-serveur)
3. [Configuration de la base de données](#configuration-de-la-base-de-données)
4. [Configuration de l'environnement](#configuration-de-lenvironnement)
5. [Déploiement du Backend](#déploiement-du-backend)
6. [Déploiement du Frontend](#déploiement-du-frontend)
7. [Configuration Nginx (Reverse Proxy)](#configuration-nginx-reverse-proxy)
8. [Gestion des processus avec PM2](#gestion-des-processus-avec-pm2)
9. [Configuration SSL/HTTPS](#configuration-sslhttps)
10. [Sécurité](#sécurité)
11. [Monitoring et logs](#monitoring-et-logs)
12. [Mise à jour de l'application](#mise-à-jour-de-lapplication)

---

## Prérequis

### Logiciels requis sur le serveur

- **Node.js** 18+ et npm
- **PostgreSQL** 14+
- **Nginx** (pour le reverse proxy)
- **PM2** (pour la gestion des processus)
- **Certbot** (pour SSL/HTTPS, optionnel mais recommandé)
- **Git** (pour cloner le dépôt)

### Exemple d'installation sur Ubuntu/Debian

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installation de PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Installation de Nginx
sudo apt install -y nginx

# Installation de PM2 globalement
sudo npm install -g pm2

# Installation de Certbot (pour SSL)
sudo apt install -y certbot python3-certbot-nginx

# Vérification des versions
node --version
npm --version
psql --version
nginx -v
pm2 --version
```

---

## Préparation du serveur

### 1. Créer un utilisateur pour l'application

```bash
# Créer un utilisateur non-root pour l'application
sudo adduser spotichris
sudo usermod -aG sudo spotichris

# Se connecter en tant que cet utilisateur
su - spotichris
```

### 2. Cloner le dépôt

```bash
cd /home/spotichris
git clone https://github.com/chris59820-cyber/spotichris.git
cd spotichris
```

### 3. Créer les répertoires nécessaires

```bash
# Créer le répertoire pour les uploads
mkdir -p backend/uploads/music
mkdir -p backend/uploads/video
mkdir -p backend/uploads/thumbnails

# Donner les permissions appropriées
chmod -R 755 backend/uploads
```

---

## Configuration de la base de données

### 1. Créer la base de données PostgreSQL

```bash
# Se connecter à PostgreSQL en tant que superutilisateur
sudo -u postgres psql

# Dans le shell PostgreSQL
CREATE DATABASE spotichris;
CREATE USER spotichris_user WITH PASSWORD 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON DATABASE spotichris TO spotichris_user;
\q
```

### 2. Initialiser le schéma de la base de données

```bash
cd /home/spotichris/spotichris/backend
npm install
npm run db:init
```

---

## Configuration de l'environnement

### 1. Fichier `.env` pour le Backend

Créez un fichier `.env` dans le répertoire `backend/` :

```bash
cd /home/spotichris/spotichris/backend
nano .env
```

Contenu du fichier `.env` :

```env
# Environnement
NODE_ENV=production

# Port du serveur
PORT=3000

# Configuration PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spotichris
DB_USER=spotichris_user
DB_PASSWORD=votre_mot_de_passe_securise

# JWT Configuration
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi
JWT_REFRESH_SECRET=votre_refresh_secret_tres_securise_changez_moi
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# URL du frontend (pour CORS)
FRONTEND_URL=https://votre-domaine.com

# Configuration des uploads
UPLOAD_MAX_SIZE=2147483648
UPLOAD_PATH=./uploads
```

**⚠️ IMPORTANT :** 
- Changez tous les secrets et mots de passe par des valeurs sécurisées
- Utilisez un générateur de secrets pour `JWT_SECRET` et `JWT_REFRESH_SECRET`
- Ne commitez jamais le fichier `.env` dans Git

### 2. Générer des secrets sécurisés

```bash
# Générer un secret JWT aléatoire
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Déploiement du Backend

### 1. Installer les dépendances

```bash
cd /home/spotichris/spotichris/backend
npm install --production
```

### 2. Compiler TypeScript

```bash
npm run build
```

Cela créera le répertoire `dist/` avec le code JavaScript compilé.

### 3. Vérifier la configuration

```bash
# Tester la connexion à la base de données
npm run db:init
```

### 4. Créer le fichier de configuration PM2

Créez un fichier `ecosystem.config.js` dans le répertoire `backend/` :

```javascript
module.exports = {
  apps: [{
    name: 'spotichris-backend',
    script: './dist/index.js',
    instances: 2, // Nombre d'instances (ou 'max' pour utiliser tous les CPU)
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads']
  }]
}
```

### 5. Créer le répertoire de logs

```bash
mkdir -p backend/logs
```

### 6. Démarrer avec PM2

```bash
cd /home/spotichris/spotichris/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

La commande `pm2 startup` vous donnera une commande à exécuter avec `sudo` pour démarrer PM2 au boot.

### 7. Vérifier le statut

```bash
pm2 status
pm2 logs spotichris-backend
```

---

## Déploiement du Frontend

### 1. Installer les dépendances

```bash
cd /home/spotichris/spotichris/frontend
npm install
```

### 2. Configurer l'URL de l'API

Modifiez `frontend/vite.config.ts` pour la production :

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Désactiver en production pour la sécurité
  },
  // Pas besoin de proxy en production, Nginx gérera le routage
})
```

### 3. Créer un fichier `.env.production` (optionnel)

Si vous utilisez des variables d'environnement dans le frontend :

```bash
cd /home/spotichris/spotichris/frontend
nano .env.production
```

```env
VITE_API_URL=https://votre-domaine.com/api
VITE_WS_URL=wss://votre-domaine.com
```

### 4. Compiler le frontend

```bash
npm run build
```

Cela créera le répertoire `dist/` avec les fichiers statiques.

### 5. Copier les fichiers dans le répertoire Nginx

```bash
sudo cp -r frontend/dist/* /var/www/spotichris/
sudo chown -R www-data:www-data /var/www/spotichris
```

---

## Configuration Nginx (Reverse Proxy)

### 1. Créer la configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/spotichris
```

Contenu de la configuration :

```nginx
# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    
    # Redirection pour Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirection vers HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    # Certificats SSL (seront générés par Certbot)
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;
    
    # Configuration SSL recommandée
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Taille maximale des uploads (2GB)
    client_max_body_size 2G;
    client_body_timeout 300s;

    # Logs
    access_log /var/log/nginx/spotichris_access.log;
    error_log /var/log/nginx/spotichris_error.log;

    # Servir les fichiers statiques du frontend
    root /var/www/spotichris;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Routes API - Proxy vers le backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # WebSocket pour Socket.IO
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Servir les fichiers uploadés
    location /uploads {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache pour les fichiers statiques
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Routes du frontend (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Sécurité - Bloquer l'accès aux fichiers sensibles
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

### 2. Activer le site

```bash
sudo ln -s /etc/nginx/sites-available/spotichris /etc/nginx/sites-enabled/
sudo nginx -t  # Tester la configuration
sudo systemctl reload nginx
```

---

## Configuration SSL/HTTPS

### 1. Obtenir un certificat SSL avec Let's Encrypt

```bash
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

Certbot va :
- Générer les certificats SSL
- Modifier automatiquement la configuration Nginx
- Configurer le renouvellement automatique

### 2. Vérifier le renouvellement automatique

```bash
sudo certbot renew --dry-run
```

Le renouvellement est automatique via un cron job installé par Certbot.

---

## Sécurité

### 1. Configuration du pare-feu (UFW)

```bash
# Activer UFW
sudo ufw enable

# Autoriser SSH (important avant de fermer les autres ports !)
sudo ufw allow 22/tcp

# Autoriser HTTP et HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Vérifier le statut
sudo ufw status
```

### 2. Sécuriser PostgreSQL

```bash
# Modifier pg_hba.conf pour n'autoriser que les connexions locales
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Assurez-vous que les lignes suivantes sont présentes :

```
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
```

### 3. Mettre à jour régulièrement

```bash
sudo apt update && sudo apt upgrade -y
```

### 4. Permissions des fichiers

```bash
# S'assurer que les fichiers sensibles ne sont pas accessibles publiquement
chmod 600 backend/.env
chmod 700 backend/uploads
```

---

## Monitoring et logs

### 1. Logs PM2

```bash
# Voir les logs en temps réel
pm2 logs spotichris-backend

# Voir les logs des 100 dernières lignes
pm2 logs spotichris-backend --lines 100

# Voir les métriques
pm2 monit
```

### 2. Logs Nginx

```bash
# Logs d'accès
sudo tail -f /var/log/nginx/spotichris_access.log

# Logs d'erreur
sudo tail -f /var/log/nginx/spotichris_error.log
```

### 3. Monitoring système

```bash
# Utilisation des ressources
htop

# Espace disque
df -h

# Mémoire
free -h
```

### 4. Health Check

L'application expose un endpoint de health check :

```bash
curl https://votre-domaine.com/health
```

---

## Mise à jour de l'application

### 1. Sauvegarder la base de données

```bash
# Créer une sauvegarde
pg_dump -U spotichris_user -d spotichris > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Mettre à jour le code

```bash
cd /home/spotichris/spotichris
git pull origin main
```

### 3. Mettre à jour le backend

```bash
cd backend
npm install --production
npm run build
pm2 restart spotichris-backend
```

### 4. Mettre à jour le frontend

```bash
cd frontend
npm install
npm run build
sudo cp -r dist/* /var/www/spotichris/
sudo chown -R www-data:www-data /var/www/spotichris
```

### 5. Vérifier que tout fonctionne

```bash
pm2 status
pm2 logs spotichris-backend --lines 50
curl https://votre-domaine.com/health
```

---

## Dépannage

### Problèmes courants

#### Le backend ne démarre pas

```bash
# Vérifier les logs
pm2 logs spotichris-backend

# Vérifier la configuration
cat backend/.env

# Tester la connexion à la base de données
cd backend
npm run db:init
```

#### Erreurs 502 Bad Gateway

- Vérifier que le backend est en cours d'exécution : `pm2 status`
- Vérifier les logs Nginx : `sudo tail -f /var/log/nginx/spotichris_error.log`
- Vérifier que le port 3000 est accessible : `curl http://localhost:3000/health`

#### Erreurs CORS

- Vérifier que `FRONTEND_URL` dans `.env` correspond à votre domaine
- Vérifier la configuration CORS dans `backend/src/index.ts`

#### Problèmes de permissions

```bash
# Corriger les permissions des uploads
sudo chown -R spotichris:spotichris backend/uploads
chmod -R 755 backend/uploads
```

---

## Checklist de déploiement

- [ ] Serveur configuré avec tous les prérequis
- [ ] PostgreSQL installé et base de données créée
- [ ] Fichier `.env` configuré avec des secrets sécurisés
- [ ] Backend compilé et démarré avec PM2
- [ ] Frontend compilé et déployé
- [ ] Nginx configuré et actif
- [ ] SSL/HTTPS configuré avec Certbot
- [ ] Pare-feu configuré
- [ ] Health check fonctionnel
- [ ] Logs configurés et accessibles
- [ ] Sauvegarde de la base de données planifiée

---

## Support

Pour toute question ou problème, consultez :
- `docs/TROUBLESHOOTING.md` - Guide de dépannage
- `docs/API.md` - Documentation de l'API
- Issues GitHub : https://github.com/chris59820-cyber/spotichris/issues



