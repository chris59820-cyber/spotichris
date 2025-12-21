//
//  MainViewController.swift
//  Spotichris
//
//  Created for Spotichris
//

import UIKit
import WebKit

class MainViewController: UIViewController {
    
    private var webView: WKWebView!
    private let webAppURL = "http://localhost:5173" // URL de l'application web React
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
        loadWebApp()
    }
    
    private func setupWebView() {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        webView = WKWebView(frame: view.bounds, configuration: configuration)
        webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        webView.navigationDelegate = self
        
        view.addSubview(webView)
    }
    
    private func loadWebApp() {
        guard let url = URL(string: webAppURL) else {
            print("❌ URL invalide: \(webAppURL)")
            return
        }
        
        let request = URLRequest(url: url)
        webView.load(request)
    }
    
    // Méthode pour recevoir les commandes depuis CarPlay
    func handleCarPlayCommand(_ command: String, value: Double? = nil) {
        let script: String
        switch command {
        case "play":
            script = "window.postMessage({ type: 'CARPLAY_COMMAND', command: 'play' }, '*');"
        case "pause":
            script = "window.postMessage({ type: 'CARPLAY_COMMAND', command: 'pause' }, '*');"
        case "next":
            script = "window.postMessage({ type: 'CARPLAY_COMMAND', command: 'next' }, '*');"
        case "previous":
            script = "window.postMessage({ type: 'CARPLAY_COMMAND', command: 'previous' }, '*');"
        case "seek":
            if let time = value {
                script = "window.postMessage({ type: 'CARPLAY_COMMAND', command: 'seek', value: \(time) }, '*');"
            } else {
                return
            }
        default:
            return
        }
        
        webView.evaluateJavaScript(script) { result, error in
            if let error = error {
                print("❌ Erreur lors de l'exécution de la commande CarPlay: \(error)")
            }
        }
    }
    
    // Méthode pour obtenir l'état de lecture actuel
    func getPlaybackState(completion: @escaping ([String: Any]?) -> Void) {
        let script = """
            (function() {
                // Essayer d'obtenir l'état depuis le PlayerContext
                if (window.playerState) {
                    return window.playerState;
                }
                // Essayer d'obtenir depuis React
                if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
                    // Accès aux contextes React (méthode alternative)
                }
                return null;
            })();
        """
        
        webView.evaluateJavaScript(script) { result, error in
            if let error = error {
                print("❌ Erreur lors de la récupération de l'état: \(error)")
                completion(nil)
                return
            }
            
            if let state = result as? [String: Any] {
                completion(state)
            } else {
                completion(nil)
            }
        }
    }
    
    // Méthode pour écouter les changements d'état depuis l'application web
    func setupPlaybackStateListener() {
        let script = """
            (function() {
                // Écouter les événements de changement d'état
                window.addEventListener('message', function(event) {
                    if (event.data && event.data.type === 'PLAYBACK_STATE_CHANGED') {
                        window.webkit.messageHandlers.playbackStateChanged.postMessage(event.data.state);
                    }
                });
                
                // Écouter les événements du PlayerContext (si exposé)
                if (window.addEventListener) {
                    window.addEventListener('playerStateChanged', function(event) {
                        window.webkit.messageHandlers.playbackStateChanged.postMessage(event.detail);
                    });
                }
            })();
        """
        
        webView.evaluateJavaScript(script) { result, error in
            if let error = error {
                print("❌ Erreur lors de la configuration de l'écouteur: \(error)")
            } else {
                print("✅ Écouteur d'état de lecture configuré")
            }
        }
    }
}

extension MainViewController: WKNavigationDelegate {
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        print("✅ Application web chargée")
        
        // Injecter le script pour écouter les changements d'état
        let script = """
            (function() {
                // Écouter les changements d'état du lecteur
                if (window.addEventListener) {
                    window.addEventListener('playerStateChanged', function(event) {
                        window.playerState = event.detail;
                    });
                }
            })();
        """
        webView.evaluateJavaScript(script, completionHandler: nil)
    }
}

