//
//  SceneDelegate.swift
//  Spotichris
//
//  Created for Spotichris
//

import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    
    var window: UIWindow?
    
    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = (scene as? UIWindowScene) else { return }
        
        window = UIWindow(windowScene: windowScene)
        
        // Créer la vue principale avec WebView
        let mainViewController = MainViewController()
        window?.rootViewController = mainViewController
        window?.makeKeyAndVisible()
    }
    
    func sceneDidDisconnect(_ scene: UIScene) {
        // Appelé quand la scène est déconnectée
    }
    
    func sceneDidBecomeActive(_ scene: UIScene) {
        // Appelé quand la scène devient active
    }
    
    func sceneWillResignActive(_ scene: UIScene) {
        // Appelé quand la scène va devenir inactive
    }
    
    func sceneWillEnterForeground(_ scene: UIScene) {
        // Appelé quand la scène entre au premier plan
    }
    
    func sceneDidEnterBackground(_ scene: UIScene) {
        // Appelé quand la scène entre en arrière-plan
    }
}






