#!/bin/bash

# Script de déploiement pour Spotichris
# Usage: ./deploy.sh [backend|frontend|all]

set -e  # Arrêter en cas d'erreur

DEPLOY_TYPE=${1:-all}
PROJECT_DIR="/home/spotichris/spotichris"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
NGINX_WEB_DIR="/var/www/spotichris"

echo "🚀 Déploiement Spotichris - Type: $DEPLOY_TYPE"

# Fonction pour déployer le backend
deploy_backend() {
    echo "📦 Déploiement du backend..."
    cd $BACKEND_DIR
    
    echo "  → Installation des dépendances..."
    npm install --production
    
    echo "  → Compilation TypeScript..."
    npm run build
    
    echo "  → Vérification de la base de données..."
    npm run db:init || echo "  ⚠️  Vérifiez manuellement la base de données"
    
    echo "  → Redémarrage avec PM2..."
    pm2 restart spotichris-backend || pm2 start ecosystem.config.js
    
    echo "  ✅ Backend déployé avec succès"
}

# Fonction pour déployer le frontend
deploy_frontend() {
    echo "📦 Déploiement du frontend..."
    cd $FRONTEND_DIR
    
    echo "  → Installation des dépendances..."
    npm install
    
    echo "  → Compilation du frontend..."
    npm run build
    
    echo "  → Copie vers le répertoire Nginx..."
    sudo rm -rf $NGINX_WEB_DIR/*
    sudo cp -r dist/* $NGINX_WEB_DIR/
    sudo chown -R www-data:www-data $NGINX_WEB_DIR
    
    echo "  ✅ Frontend déployé avec succès"
}

# Fonction pour sauvegarder la base de données
backup_database() {
    echo "💾 Sauvegarde de la base de données..."
    BACKUP_FILE="$PROJECT_DIR/backups/backup_$(date +%Y%m%d_%H%M%S).sql"
    mkdir -p $PROJECT_DIR/backups
    
    # Récupérer les credentials depuis .env
    source $BACKEND_DIR/.env
    pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_FILE
    
    echo "  ✅ Sauvegarde créée: $BACKUP_FILE"
}

# Exécution
case $DEPLOY_TYPE in
    backend)
        backup_database
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        backup_database
        deploy_backend
        deploy_frontend
        echo "🔄 Rechargement de Nginx..."
        sudo systemctl reload nginx
        ;;
    *)
        echo "❌ Type de déploiement invalide: $DEPLOY_TYPE"
        echo "Usage: ./deploy.sh [backend|frontend|all]"
        exit 1
        ;;
esac

echo "✅ Déploiement terminé!"
echo "📊 Statut PM2:"
pm2 status

