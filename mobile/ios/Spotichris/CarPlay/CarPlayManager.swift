//
//  CarPlayManager.swift
//  Spotichris
//
//  Gestionnaire CarPlay pour Spotichris
//  Configure les templates CarPlay et gère la synchronisation avec l'application web
//

import CarPlay
import MediaPlayer

class CarPlayManager: NSObject {
    
    weak var interfaceController: CPInterfaceController?
    weak var mainViewController: MainViewController?
    
    private var nowPlayingTemplate: CPNowPlayingTemplate?
    private var tabBarTemplate: CPTabBarTemplate?
    
    init(interfaceController: CPInterfaceController) {
        self.interfaceController = interfaceController
        super.init()
    }
    
    func setupNowPlayingTemplate() {
        // Obtenir le template Now Playing partagé
        nowPlayingTemplate = CPNowPlayingTemplate.shared
        
        // Configurer les boutons d'action
        nowPlayingTemplate?.upNextButtonTitle = "File d'attente"
        nowPlayingTemplate?.isUpNextButtonEnabled = true
        
        // Configurer le MediaPlayer pour la synchronisation
        setupMediaPlayer()
        
        // Créer le template de navigation avec onglets
        setupTabBarTemplate()
    }
    
    private func setupTabBarTemplate() {
        // Créer les onglets
        let libraryTab = createLibraryTab()
        let searchTab = createSearchTab()
        
        // Créer le TabBar avec Now Playing comme premier onglet
        // Note: CPTabBarTemplate nécessite au moins 2 templates
        if let nowPlaying = nowPlayingTemplate {
            tabBarTemplate = CPTabBarTemplate(templates: [nowPlaying, libraryTab, searchTab])
            interfaceController?.setRootTemplate(tabBarTemplate!, animated: true)
        } else {
            // Fallback: utiliser Now Playing seul
            if let nowPlaying = nowPlayingTemplate {
                interfaceController?.setRootTemplate(nowPlaying, animated: true)
            }
        }
    }
    
    private func createLibraryTab() -> CPListTemplate {
        let sections = [
            CPListSection(items: [
                CPListItem(text: "Mes favoris", detailText: nil, image: nil, accessoryImage: nil, accessoryType: .disclosureIndicator) { [weak self] _, completion in
                    self?.showFavorites()
                    completion()
                },
                CPListItem(text: "Mes playlists", detailText: nil, image: nil, accessoryImage: nil, accessoryType: .disclosureIndicator) { [weak self] _, completion in
                    self?.showPlaylists()
                    completion()
                },
                CPListItem(text: "Musique récente", detailText: nil, image: nil, accessoryImage: nil, accessoryType: .disclosureIndicator) { [weak self] _, completion in
                    self?.showRecentMusic()
                    completion()
                },
            ])
        ]
        
        return CPListTemplate(title: "Bibliothèque", sections: sections)
    }
    
    private func createSearchTab() -> CPListTemplate {
        let sections = [
            CPListSection(items: [
                CPListItem(text: "Rechercher de la musique", detailText: nil, image: nil, accessoryImage: nil, accessoryType: .none) { [weak self] _, completion in
                    self?.showSearchInterface()
                    completion()
                },
            ])
        ]
        
        return CPListTemplate(title: "Rechercher", sections: sections)
    }
    
    private func showFavorites() {
        // Charger les favoris depuis l'application web via MainViewController
        mainViewController?.getPlaybackState { [weak self] state in
            // TODO: Faire un appel API pour récupérer les favoris
            let items: [CPListItem] = []
            let section = CPListSection(items: items)
            let template = CPListTemplate(title: "Mes favoris", sections: [section])
            self?.interfaceController?.pushTemplate(template, animated: true)
        }
    }
    
    private func showPlaylists() {
        // TODO: Charger les playlists depuis l'API
        let items: [CPListItem] = []
        let section = CPListSection(items: items)
        let template = CPListTemplate(title: "Mes playlists", sections: [section])
        interfaceController?.pushTemplate(template, animated: true)
    }
    
    private func showRecentMusic() {
        // TODO: Charger la musique récente depuis l'API
        let items: [CPListItem] = []
        let section = CPListSection(items: items)
        let template = CPListTemplate(title: "Musique récente", sections: [section])
        interfaceController?.pushTemplate(template, animated: true)
    }
    
    private func showSearchInterface() {
        // TODO: Implémenter l'interface de recherche
        let template = CPListTemplate(title: "Rechercher", sections: [])
        interfaceController?.pushTemplate(template, animated: true)
    }
    
    private func setupMediaPlayer() {
        let commandCenter = MPRemoteCommandCenter.shared()
        
        // Activer toutes les commandes
        commandCenter.playCommand.isEnabled = true
        commandCenter.pauseCommand.isEnabled = true
        commandCenter.togglePlayPauseCommand.isEnabled = true
        commandCenter.nextTrackCommand.isEnabled = true
        commandCenter.previousTrackCommand.isEnabled = true
        commandCenter.skipForwardCommand.isEnabled = true
        commandCenter.skipBackwardCommand.isEnabled = true
        commandCenter.changePlaybackPositionCommand.isEnabled = true
        
        // Play
        commandCenter.playCommand.addTarget { [weak self] _ in
            self?.mainViewController?.handleCarPlayCommand("play")
            return .success
        }
        
        // Pause
        commandCenter.pauseCommand.addTarget { [weak self] _ in
            self?.mainViewController?.handleCarPlayCommand("pause")
            return .success
        }
        
        // Toggle Play/Pause
        commandCenter.togglePlayPauseCommand.addTarget { [weak self] _ in
            // Alterner entre play et pause
            if let state = self?.getCurrentPlaybackState(), state.isPlaying {
                self?.mainViewController?.handleCarPlayCommand("pause")
            } else {
                self?.mainViewController?.handleCarPlayCommand("play")
            }
            return .success
        }
        
        // Next Track
        commandCenter.nextTrackCommand.addTarget { [weak self] _ in
            self?.mainViewController?.handleCarPlayCommand("next")
            return .success
        }
        
        // Previous Track
        commandCenter.previousTrackCommand.addTarget { [weak self] _ in
            self?.mainViewController?.handleCarPlayCommand("previous")
            return .success
        }
        
        // Seek Forward (10 secondes)
        commandCenter.skipForwardCommand.preferredIntervals = [10]
        commandCenter.skipForwardCommand.addTarget { [weak self] _ in
            self?.mainViewController?.handleCarPlayCommand("seek", value: 10)
            return .success
        }
        
        // Seek Backward (10 secondes)
        commandCenter.skipBackwardCommand.preferredIntervals = [10]
        commandCenter.skipBackwardCommand.addTarget { [weak self] _ in
            self?.mainViewController?.handleCarPlayCommand("seek", value: -10)
            return .success
        }
        
        // Change Playback Position (scrub)
        commandCenter.changePlaybackPositionCommand.addTarget { [weak self] event in
            if let event = event as? MPChangePlaybackPositionCommandEvent {
                self?.mainViewController?.handleCarPlayCommand("seek", value: event.positionTime)
                return .success
            }
            return .commandFailed
        }
    }
    
    // Obtenir l'état de lecture actuel (depuis MainViewController)
    private func getCurrentPlaybackState() -> (isPlaying: Bool, currentTime: TimeInterval)? {
        // Cette méthode devrait interroger MainViewController pour obtenir l'état
        // Pour l'instant, retourner nil (sera implémenté avec la synchronisation WebSocket)
        return nil
    }
    
    // Mettre à jour les métadonnées du média
    func updateNowPlayingInfo(title: String, artist: String, album: String, duration: TimeInterval, currentTime: TimeInterval, artwork: UIImage? = nil) {
        var nowPlayingInfo = [String: Any]()
        
        nowPlayingInfo[MPMediaItemPropertyTitle] = title
        nowPlayingInfo[MPMediaItemPropertyArtist] = artist
        nowPlayingInfo[MPMediaItemPropertyAlbumTitle] = album
        nowPlayingInfo[MPMediaItemPropertyPlaybackDuration] = duration
        nowPlayingInfo[MPNowPlayingInfoPropertyElapsedPlaybackTime] = currentTime
        nowPlayingInfo[MPNowPlayingInfoPropertyPlaybackRate] = 1.0
        
        // Ajouter l'image si disponible
        if let artwork = artwork {
            let mpArtwork = MPMediaItemArtwork(boundsSize: artwork.size) { _ in artwork }
            nowPlayingInfo[MPMediaItemPropertyArtwork] = mpArtwork
        }
        
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlayingInfo
    }
    
    // Mettre à jour l'état de lecture
    func updatePlaybackState(isPlaying: Bool, currentTime: TimeInterval? = nil) {
        var nowPlayingInfo = MPNowPlayingInfoCenter.default().nowPlayingInfo ?? [:]
        nowPlayingInfo[MPNowPlayingInfoPropertyPlaybackRate] = isPlaying ? 1.0 : 0.0
        
        if let currentTime = currentTime {
            nowPlayingInfo[MPNowPlayingInfoPropertyElapsedPlaybackTime] = currentTime
        }
        
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlayingInfo
    }
    
    // Synchroniser avec l'application web
    func syncWithWebApp() {
        mainViewController?.getPlaybackState { [weak self] state in
            guard let state = state,
                  let title = state["title"] as? String,
                  let artist = state["artist"] as? String,
                  let album = state["album"] as? String,
                  let duration = state["duration"] as? TimeInterval,
                  let currentTime = state["currentTime"] as? TimeInterval,
                  let isPlaying = state["isPlaying"] as? Bool else {
                return
            }
            
            self?.updateNowPlayingInfo(
                title: title,
                artist: artist,
                album: album,
                duration: duration,
                currentTime: currentTime
            )
            
            self?.updatePlaybackState(isPlaying: isPlaying, currentTime: currentTime)
        }
    }
}
