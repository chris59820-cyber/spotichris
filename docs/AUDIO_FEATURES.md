# Fonctionnalités Audio Avancées

Ce document décrit les fonctionnalités audio avancées implémentées dans Spotichris.

## Table des matières

1. [Crossfade](#crossfade)
2. [Égaliseur Audio](#égaliseur-audio)
3. [Mode Voiture](#mode-voiture)
4. [Enceintes Connectées](#enceintes-connectées)

## Crossfade

### Description

Le crossfade permet une transition en fondu entre deux morceaux, créant une expérience d'écoute plus fluide et professionnelle.

### Fonctionnalités

- **Activation/Désactivation** : Le crossfade peut être activé ou désactivé depuis les paramètres de l'égaliseur
- **Durée personnalisable** : La durée du crossfade peut être ajustée de 1 à 10 secondes (par défaut : 3 secondes)
- **Fade-in automatique** : Au démarrage d'un morceau, un fade-in peut être appliqué si activé
- **Fade-out automatique** : À la fin d'un morceau, un fade-out peut être appliqué si activé

### Utilisation

1. Ouvrir l'égaliseur en cliquant sur le bouton 🎚️ dans la barre de lecture
2. Dans la section "Crossfade", cocher "Activer le crossfade"
3. Ajuster la durée du crossfade avec le curseur (1-10 secondes)
4. Le crossfade s'appliquera automatiquement lors des changements de morceaux

### Notes techniques

- Le crossfade fonctionne mieux avec une queue de lecture (à implémenter)
- Pour un crossfade optimal, le morceau suivant doit être préchargé avant la fin du morceau actuel
- Le crossfade utilise des ajustements de volume progressifs pour créer la transition

## Égaliseur Audio

### Description

Un égaliseur audio 10 bandes personnalisable permettant d'ajuster les fréquences audio pour une expérience d'écoute optimale.

### Fonctionnalités

- **10 bandes de fréquences** :
  - 60 Hz (Sub-bass)
  - 170 Hz (Bass)
  - 310 Hz (Low midrange)
  - 600 Hz (Midrange)
  - 1000 Hz (Upper midrange)
  - 3000 Hz (Presence)
  - 6000 Hz (Brilliance)
  - 12000 Hz (Air)
  - 14000 Hz (High)
  - 16000 Hz (Ultra high)

- **Ajustement de gain** : Chaque bande peut être ajustée de -12 dB à +12 dB
- **Presets prédéfinis** :
  - Flat (plat)
  - Bass Boost (amplification des basses)
  - Treble Boost (amplification des aigus)
  - Vocal Boost (amplification des voix)
  - Rock
  - Jazz
  - Classical
  - Electronic

- **Activation/Désactivation** : L'égaliseur peut être activé ou désactivé instantanément
- **Réinitialisation** : Toutes les bandes peuvent être réinitialisées à 0 dB

### Utilisation

1. Cliquer sur le bouton 🎚️ dans la barre de lecture (uniquement pour l'audio)
2. Le modal de l'égaliseur s'ouvre
3. Utiliser les curseurs verticaux pour ajuster chaque bande de fréquence
4. Sélectionner un preset depuis le menu déroulant pour appliquer une configuration prédéfinie
5. Activer/désactiver l'égaliseur avec le bouton "Activer/Désactiver"
6. Réinitialiser toutes les bandes avec le bouton "Réinitialiser"

### Notes techniques

- L'égaliseur utilise l'API Web Audio (BiquadFilterNode) pour appliquer les filtres
- Les réglages sont appliqués en temps réel
- L'égaliseur doit être initialisé une seule fois par élément audio pour éviter les erreurs de connexion multiple

## Mode Voiture

### Description

Le mode voiture optimise l'interface utilisateur pour une utilisation en conduisant, avec des boutons plus grands, un contraste élevé, et une interface simplifiée.

### Fonctionnalités

- **Boutons agrandis** : Tous les boutons sont agrandis pour faciliter l'interaction tactile
- **Texte agrandi** : La taille du texte est augmentée pour une meilleure lisibilité
- **Contraste élevé** : Les couleurs sont optimisées pour une meilleure visibilité
- **Interface simplifiée** : L'interface est épurée pour réduire les distractions

### Utilisation

1. Cliquer sur le bouton 🚗 dans la barre de lecture
2. Le mode voiture s'active automatiquement
3. L'interface s'adapte avec des éléments plus grands et plus visibles
4. Cliquer à nouveau sur le bouton pour désactiver le mode voiture

### Notes techniques

- Le mode voiture applique des styles CSS personnalisés via une classe `car-mode-active`
- Les paramètres sont sauvegardés dans `localStorage`
- Le mode peut être détecté automatiquement si l'application est utilisée via CarPlay ou Android Auto

## Enceintes Connectées

### Description

Intégration avec les enceintes connectées et systèmes de diffusion (Chromecast, AirPlay, DLNA, Bluetooth).

### Fonctionnalités

- **Découverte automatique** : Les appareils disponibles sont découverts automatiquement
- **Connexion simple** : Un clic pour se connecter à un appareil
- **Diffusion en continu** : Le média en cours de lecture peut être diffusé vers l'appareil connecté
- **Support multi-protocole** :
  - Chromecast (via Google Cast SDK)
  - AirPlay (Safari uniquement)
  - DLNA (à implémenter)
  - Bluetooth (à implémenter)

### Utilisation

1. Cliquer sur le bouton 📺 dans la barre de lecture
2. Un menu déroulant affiche les appareils disponibles
3. Sélectionner un appareil pour s'y connecter
4. Le média en cours de lecture sera automatiquement diffusé vers l'appareil
5. Cliquer sur "Déconnecter" pour revenir à la lecture locale

### Notes techniques

- **Chromecast** : Nécessite l'API Google Cast SDK (à intégrer)
- **AirPlay** : Disponible uniquement dans Safari sur macOS/iOS
- **DLNA** : Nécessite une implémentation serveur DLNA
- **Bluetooth** : Nécessite l'API Web Bluetooth (support limité)

### Limitations actuelles

- La découverte d'appareils est simulée (données de test)
- La connexion réelle nécessite l'intégration des SDKs appropriés
- Le cast réel nécessite une configuration serveur pour le streaming

## Architecture Technique

### Hooks personnalisés

- `useCrossfade` : Gère les transitions en fondu entre morceaux
- `useEqualizer` : Gère l'égaliseur audio avec l'API Web Audio
- `useCarMode` : Gère l'état et les paramètres du mode voiture
- `useSmartSpeakers` : Gère la découverte et la connexion aux enceintes

### Composants

- `Equalizer` : Composant d'égaliseur avec interface utilisateur
- `CarModeOverlay` : Composant pour appliquer les styles du mode voiture
- `Modal` : Composant modal réutilisable pour l'égaliseur

### Services

- Les services pour Chromecast et AirPlay sont définis dans `useSmartSpeakers` mais nécessitent l'intégration des SDKs réels

## Prochaines étapes

1. **Queue de lecture** : Implémenter une queue de lecture pour un crossfade optimal
2. **SDKs réels** : Intégrer les SDKs Google Cast et AirPlay
3. **DLNA** : Implémenter le support DLNA
4. **Bluetooth** : Implémenter le support Bluetooth
5. **Commandes vocales** : Ajouter le support des commandes vocales pour le mode voiture
6. **Presets personnalisés** : Permettre aux utilisateurs de créer et sauvegarder leurs propres presets d'égaliseur

