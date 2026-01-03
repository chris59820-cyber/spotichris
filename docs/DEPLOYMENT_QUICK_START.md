# Guide de Déploiement Rapide - Spotichris

Guide condensé pour un déploiement rapide en production.

## 🚀 Déploiement Express (5 minutes)

### 1. Prérequis sur le serveur

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs postgresql nginx
sudo npm install -g pm2
```

### 2. Configuration PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE spotichris;
CREATE USER spotichris_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE spotichris TO spotichris_user;
\q
```

### 3. Cloner et configurer

```bash
cd /home
sudo adduser spotichris
sudo usermod -aG sudo spotichris
su - spotichris
cd ~
git clone https://github.com/chris59820-cyber/spotichris.git
cd spotichris
```

### 4. Backend

```bash
cd backend
npm install --production

# Créer .env
cat > .env << EOF
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spotichris
DB_USER=spotichris_user
DB_PASSWORD=votre_mot_de_passe
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
FRONTEND_URL=https://votre-domaine.com
EOF

npm run build
npm run db:init
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Suivre les instructions
```

### 5. Frontend

```bash
cd ../frontend
npm install
npm run build
sudo mkdir -p /var/www/spotichris
sudo cp -r dist/* /var/www/spotichris/
sudo chown -R www-data:www-data /var/www/spotichris
```

### 6. Nginx

```bash
sudo nano /etc/nginx/sites-available/spotichris
```

Coller la configuration depuis `docs/DEPLOYMENT.md` (section Nginx), puis :

```bash
sudo ln -s /etc/nginx/sites-available/spotichris /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

### 8. Pare-feu

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## ✅ Vérification

```bash
# Backend
pm2 status
curl http://localhost:3000/health

# Frontend
curl https://votre-domaine.com/health
```

## 🔄 Mise à jour

```bash
cd ~/spotichris
./deploy.sh all
```

## 📚 Documentation complète

Voir `docs/DEPLOYMENT.md` pour les détails complets.




