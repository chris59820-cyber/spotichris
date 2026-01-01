//
//  AppDelegate.swift
//  Spotichris
//
//  Created for Spotichris
//

import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    var window: UIWindow?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Configuration initiale de l'application
        return true
    }
    
    // MARK: UISceneSession Lifecycle
    
    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        // Configuration pour les scènes normales
        if options.userActivities.first?.activityType == "CPTemplateApplicationSceneSessionRoleApplication" {
            return UISceneConfiguration(name: "CarPlayScene", sessionRole: connectingSceneSession.role)
        }
        
        return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
    }
    
    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
        // Nettoyage des scènes supprimées
    }
}






