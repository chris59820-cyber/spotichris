# Guide de Test WebSocket

Ce guide explique comment tester la connexion WebSocket et la synchronisation temps réel.

## Prérequis

1. **Backend démarré** : Le serveur doit être en cours d'exécution sur le port 3000
2. **Frontend démarré** : L'application React doit être accessible
3. **Authentification** : Vous devez être connecté pour obtenir un token JWT valide

## Méthode 1 : Page de Test dans l'Application Web

### Étapes

1. **Démarrer le backend** :
```bash
cd backend
npm run dev
```

2. **Démarrer le frontend** :
```bash
cd frontend
npm run dev
```

3. **Se connecter à l'application** :
   - Ouvrez `http://localhost:5173`
   - Connectez-vous avec vos identifiants

4. **Accéder à la page de test** :
   - Naviguez vers `http://localhost:5173/websocket-test`
   - Ou ajoutez un lien dans la sidebar (optionnel)

5. **Tester la connexion** :
   - Vérifiez que le statut affiche "Connecté" (point vert)
   - Cliquez sur "Envoyer un état de lecture"
   - Vérifiez que l'état apparaît dans "Dernier état reçu"
   - Testez les commandes (Play, Pause, Next, Previous, Seek)

### Ce qui doit fonctionner

- ✅ **Connexion** : Le statut doit passer à "Connecté" automatiquement
- ✅ **Envoi d'état** : L'état doit être envoyé et reçu
- ✅ **Commandes** : Les commandes doivent être envoyées et reçues
- ✅ **Messages** : Les messages doivent apparaître dans la console

## Méthode 2 : Script de Test Backend

### Étapes

1. **Obtenir un token JWT** :
   - Connectez-vous via l'API : `POST /api/auth/login`
   - Copiez le token de la réponse

2. **Configurer le script** :
   - Créez un fichier `.env` dans `backend/` ou exportez les variables :
   ```bash
   export TEST_TOKEN="votre-token-jwt-ici"
   export SERVER_URL="http://localhost:3000"
   ```

3. **Exécuter le script** :
```bash
cd backend
npm run test:websocket
```

### Résultats attendus

Le script doit afficher :
```
🧪 Test de connexion WebSocket
📍 Serveur: http://localhost:3000
🔑 Token: eyJhbGciOiJIUzI1NiIs...

✅ Test 1: Connexion réussie
🧪 Test 2: Ping/Pong...
✅ Test 2: Ping/Pong réussi
🧪 Test 3: Envoi d'état de lecture...
✅ Test 3: État de lecture reçu
🧪 Test 4: Envoi d'une commande...
✅ Test 4: Commande reçue
🧪 Test 5: Déconnexion...

📊 Résultats des tests:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ connection
✅ ping_pong
✅ playback_state
✅ carplay_command
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Tous les tests sont passés!
```

## Méthode 3 : Test Manuel avec l'Application

### Tester la synchronisation automatique

1. **Ouvrir deux onglets** :
   - Onglet 1 : Application principale
   - Onglet 2 : Page de test WebSocket (`/websocket-test`)

2. **Lancer une lecture** :
   - Dans l'onglet 1, lancez un média
   - Dans l'onglet 2, vérifiez que l'état est automatiquement mis à jour

3. **Tester les commandes** :
   - Dans l'onglet 2, envoyez une commande "pause"
   - Dans l'onglet 1, vérifiez que la lecture se met en pause

## Dépannage

### Le WebSocket ne se connecte pas

**Symptômes** :
- Le statut reste sur "Déconnecté"
- Messages d'erreur dans la console

**Solutions** :
1. Vérifier que le backend est démarré :
   ```bash
   curl http://localhost:3000/health
   ```

2. Vérifier le token JWT :
   - Le token doit être valide et non expiré
   - Vérifier dans `localStorage.getItem('token')`

3. Vérifier les logs du serveur :
   - Regarder les messages dans la console du backend
   - Chercher les erreurs d'authentification

4. Vérifier CORS :
   - Le frontend doit être autorisé dans la configuration CORS du backend

### Les commandes ne fonctionnent pas

**Symptômes** :
- Les commandes sont envoyées mais rien ne se passe
- Pas de réponse dans la console

**Solutions** :
1. Vérifier que `PlayerContext` écoute les commandes :
   - Ouvrir les DevTools
   - Vérifier les logs de `carPlayService`

2. Vérifier que le média est en cours de lecture :
   - Les commandes ne fonctionnent que si un média est chargé

3. Vérifier les logs du serveur :
   - Les commandes doivent apparaître dans les logs

### La synchronisation ne fonctionne pas

**Symptômes** :
- L'état n'est pas mis à jour entre les clients
- Les mises à jour sont retardées

**Solutions** :
1. Vérifier que l'état est envoyé :
   - Dans la page de test, cliquer sur "Envoyer un état de lecture"
   - Vérifier que l'état apparaît dans "Dernier état reçu"

2. Vérifier que les deux clients sont connectés :
   - Les deux onglets doivent afficher "Connecté"

3. Vérifier les logs du serveur :
   - Les mises à jour doivent apparaître dans les logs

## Tests Avancés

### Test avec CarPlay/Android Auto

1. **Démarrer l'application native** :
   - iOS : Ouvrir dans Xcode et lancer
   - Android : Installer sur un appareil

2. **Vérifier la connexion** :
   - L'application native doit se connecter au WebSocket
   - Vérifier les logs du serveur

3. **Tester les commandes** :
   - Utiliser les contrôles CarPlay/Android Auto
   - Vérifier que les commandes arrivent au serveur
   - Vérifier que l'application web reçoit les commandes

### Test de Performance

1. **Tester avec plusieurs clients** :
   - Ouvrir plusieurs onglets
   - Vérifier que tous reçoivent les mises à jour

2. **Tester la reconnexion** :
   - Déconnecter le réseau
   - Reconnecter
   - Vérifier que la reconnexion automatique fonctionne

3. **Tester la charge** :
   - Envoyer de nombreuses mises à jour
   - Vérifier que le serveur gère correctement la charge

## Vérification des Logs

### Backend

Les logs doivent afficher :
```
✅ Service WebSocket initialisé
🔌 Nouvelle connexion WebSocket: socket-id
✅ Utilisateur 1 connecté via socket socket-id
📡 État de lecture mis à jour pour l'utilisateur 1
🎮 Commande CarPlay/Android Auto reçue: play pour l'utilisateur 1
```

### Frontend

Les logs doivent afficher :
```
✅ CarPlay/Android Auto: Connecté via WebSocket
📡 État de lecture mis à jour
🎮 Commande reçue: play
```

## Conclusion

Une fois tous les tests passés, le WebSocket est correctement configuré et fonctionnel. Vous pouvez maintenant utiliser la synchronisation temps réel entre l'application web et les applications natives CarPlay/Android Auto.







