//
//  CarPlaySceneDelegate.swift
//  Spotichris
//
//  Created for Spotichris
//

import CarPlay
import MediaPlayer

class CarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
    
    var interfaceController: CPInterfaceController?
    var carPlayManager: CarPlayManager?
    var mainViewController: MainViewController?
    
    func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene, didConnect interfaceController: CPInterfaceController, to window: CPWindow) {
        print("✅ CarPlay connecté")
        
        self.interfaceController = interfaceController
        self.carPlayManager = CarPlayManager(interfaceController: interfaceController)
        
        // Obtenir la référence au MainViewController
        if let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = windowScene.windows.first,
           let mainVC = window.rootViewController as? MainViewController {
            self.mainViewController = mainVC
            carPlayManager?.mainViewController = mainVC
        }
        
        // Configurer le template de lecture
        carPlayManager?.setupNowPlayingTemplate()
        
        // Démarrer la synchronisation périodique avec l'application web
        startPeriodicSync()
    }
    
    private func startPeriodicSync() {
        // Synchroniser toutes les 2 secondes
        Timer.scheduledTimer(withTimeInterval: 2.0, repeats: true) { [weak self] _ in
            self?.carPlayManager?.syncWithWebApp()
        }
    }
    
    func templateApplicationScene(_ templateApplicationScene: CPTemplateApplicationScene, didDisconnect interfaceController: CPInterfaceController, from window: CPWindow) {
        print("❌ CarPlay déconnecté")
        
        stopPeriodicSync()
        self.interfaceController = nil
        self.carPlayManager = nil
    }
}

