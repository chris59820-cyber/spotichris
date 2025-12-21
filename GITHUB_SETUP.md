# Configuration GitHub pour Spotichris

## ✅ Étape 1 : Dépôt Git initialisé

Le dépôt Git a été initialisé avec succès à la racine du projet.

## 📋 Étape 2 : Créer un dépôt sur GitHub

1. Allez sur [GitHub](https://github.com) et connectez-vous
2. Cliquez sur le bouton **"+"** en haut à droite, puis sélectionnez **"New repository"**
3. Remplissez les informations :
   - **Repository name**: `spotichris`
   - **Description**: `Application de streaming unifié (Netflix + Spotify)`
   - **Visibility**: Choisissez Public ou Private selon vos préférences
   - **NE COCHEZ PAS** "Initialize this repository with a README" (nous avons déjà un README)
4. Cliquez sur **"Create repository"**

## 🔗 Étape 3 : Connecter le dépôt local à GitHub

Une fois le dépôt créé sur GitHub, exécutez les commandes suivantes dans le terminal (à la racine du projet) :

```bash
# Ajouter le remote GitHub (remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/VOTRE_USERNAME/spotichris.git

# Ou si vous utilisez SSH :
# git remote add origin git@github.com:VOTRE_USERNAME/spotichris.git

# Renommer la branche principale en 'main' (si nécessaire)
git branch -M main

# Pousser le code vers GitHub
git push -u origin main
```

## 🔐 Étape 4 : Authentification GitHub

Si vous utilisez HTTPS, GitHub vous demandera vos identifiants. Pour une meilleure sécurité, utilisez un **Personal Access Token** :

1. Allez dans **Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**
2. Cliquez sur **"Generate new token"**
3. Donnez un nom au token (ex: "Spotichris")
4. Sélectionnez les scopes : `repo` (accès complet aux dépôts)
5. Cliquez sur **"Generate token"**
6. **Copiez le token** (vous ne pourrez plus le voir après)
7. Utilisez ce token comme mot de passe lors du `git push`

## 📝 Commandes Git utiles

### Voir l'état du dépôt
```bash
git status
```

### Ajouter des fichiers modifiés
```bash
git add .
git commit -m "Description des changements"
git push
```

### Voir l'historique
```bash
git log --oneline
```

### Créer une nouvelle branche
```bash
git checkout -b nom-de-la-branche
git push -u origin nom-de-la-branche
```

## 🚨 Fichiers exclus (via .gitignore)

Les fichiers suivants ne seront **PAS** inclus dans le dépôt :
- `node_modules/` (dépendances)
- `.env` (variables d'environnement sensibles)
- `backend/uploads/*` (fichiers média uploadés)
- Fichiers de build et logs

## 📚 Documentation

Toute la documentation du projet se trouve dans le dossier `docs/`.

