# Guide de Test - Spotichris

Ce guide explique comment tester les fonctionnalités de l'application.

## Prérequis

1. **Base de données initialisée**
   ```bash
   cd backend
   npm run db:init
   ```

2. **Backend démarré**
   ```bash
   cd backend
   npm run dev
   ```

3. **Frontend démarré**
   ```bash
   cd frontend
   npm run dev
   ```

## Test de la Recherche et Lecture

### 1. Accéder à l'application

Ouvrez votre navigateur et allez sur `http://localhost:5173`

### 2. Se connecter (optionnel mais recommandé)

- Cliquez sur "Connexion"
- Utilisez un compte de test :
  - Email: `user@spotichris.com`
  - Mot de passe: `password123`

### 3. Tester la page d'accueil

La page d'accueil affiche automatiquement :
- 6 musiques récentes
- 6 vidéos récentes

**Actions possibles :**
- Cliquez sur une carte de média pour lancer la lecture
- Cliquez sur le bouton ▶️ pour jouer
- La barre de lecture en bas devrait afficher le contenu

### 4. Tester la recherche

1. Cliquez sur "Rechercher" dans la sidebar
2. Tapez un terme de recherche (ex: "Bohemian", "Queen", "Matrix")
3. Les résultats s'affichent automatiquement
4. Pour la musique :
   - Cliquez sur le bouton ▶️ sur une carte
   - La lecture démarre dans la PlayerBar en bas
5. Pour les vidéos :
   - Cliquez sur "Regarder"
   - (Pour l'instant, affiche un placeholder)

### 5. Contrôles du lecteur

Dans la PlayerBar (barre en bas de l'écran) :

- **Play/Pause** : Bouton ▶️ / ⏸
- **Progression** : Cliquez sur la barre de progression pour sauter
- **Volume** : Ajustez avec la barre de volume
- **Temps** : Affichage du temps actuel / durée totale

## Données de Test Disponibles

### Musiques
- Bohemian Rhapsody (Queen)
- Stairway to Heaven (Led Zeppelin)
- Hotel California (Eagles)
- One More Time (Daft Punk)
- Lose Yourself (Eminem)
- Et plus...

### Vidéos
- The Matrix
- Inception
- Interstellar
- Breaking Bad S01E01
- Et plus...

## Problèmes Courants

### Aucun contenu ne s'affiche

1. Vérifiez que la base de données est initialisée :
   ```bash
   cd backend
   npm run db:init
   ```

2. Vérifiez que le backend est démarré et accessible :
   ```bash
   curl http://localhost:3000/api/media
   ```

### La lecture ne démarre pas

1. Les URLs dans la base de données sont des exemples (https://example.com/...)
2. Pour tester avec de vrais fichiers :
   - Remplacez les URLs dans la base de données
   - Ou utilisez des URLs publiques valides (ex: fichiers audio/vidéo hébergés)

### Erreur de connexion à l'API

1. Vérifiez que le backend écoute sur le port 3000
2. Vérifiez que le proxy est configuré dans `vite.config.ts`
3. Vérifiez la console du navigateur pour les erreurs CORS

## Test des Fonctionnalités Spécifiques

### Recherche
- Recherche par titre
- Recherche par artiste
- Filtrage automatique musique/vidéo
- Affichage des résultats en temps réel

### Lecture Audio
- Démarrage de la lecture
- Pause/Reprise
- Contrôle du volume
- Barre de progression interactive
- Affichage du temps

### Interface
- Navigation entre les pages
- Affichage des médias en grille
- Design cyberpunk
- Responsive (à tester sur différentes tailles d'écran)

## Prochaines Étapes pour Tests Avancés

1. Ajouter de vrais fichiers média pour tester la lecture
2. Tester la création de playlists
3. Tester les favoris
4. Tester l'historique de lecture
5. Tester avec plusieurs utilisateurs







