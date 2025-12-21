package com.spotichris

import android.content.ComponentName
import android.content.Context
import android.content.ServiceConnection
import android.os.Bundle
import android.os.IBinder
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    
    private lateinit var webView: WebView
    private val webAppURL = "http://localhost:5173" // URL de l'application web React
    private var mediaBrowserService: SpotichrisMediaBrowserService? = null
    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            // Service connecté - MediaBrowserService est un service système
            // On utilise getInstance() pour obtenir la référence
            mediaBrowserService = SpotichrisMediaBrowserService.getInstance()
            mediaBrowserService?.setMainActivity(this@MainActivity)
        }
        
        override fun onServiceDisconnected(name: ComponentName?) {
            mediaBrowserService = null
        }
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        setupWebView()
        loadWebApp()
        setupMediaBrowserService()
    }
    
    private fun setupMediaBrowserService() {
        // Lier le service MediaBrowserService
        val intent = android.content.Intent(this, SpotichrisMediaBrowserService::class.java)
        bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE)
        
        // Obtenir une référence au service si possible
        // Note: MediaBrowserService est un service système, la liaison peut ne pas fonctionner directement
        // Dans ce cas, on utilise des méthodes statiques ou un singleton
    }
    
    override fun onDestroy() {
        super.onDestroy()
        unbindService(serviceConnection)
    }
    
    private fun setupWebView() {
        webView = findViewById(R.id.webview)
        
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
            allowFileAccess = true
            allowContentAccess = true
        }
        
        // Ajouter l'interface JavaScript pour la communication
        webView.addJavascriptInterface(this, "Android")
        
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                println("✅ Application web chargée")
                
                // Injecter le script pour écouter les changements d'état
                val script = """
                    (function() {
                        // Écouter les changements d'état du lecteur
                        if (window.addEventListener) {
                            window.addEventListener('playerStateChanged', function(event) {
                                window.playerState = event.detail;
                                if (window.Android && window.Android.onPlaybackStateChanged) {
                                    window.Android.onPlaybackStateChanged(JSON.stringify(event.detail));
                                }
                            });
                        }
                    })();
                """.trimIndent()
                
                view?.evaluateJavascript(script, null)
                
                // Configurer l'écouteur d'état
                setupPlaybackStateListener()
            }
        }
        
        webView.webChromeClient = WebChromeClient()
    }
    
    private fun loadWebApp() {
        webView.loadUrl(webAppURL)
    }
    
    // Méthode pour recevoir les commandes depuis Android Auto
    fun handleAndroidAutoCommand(command: String, value: Double? = null) {
        val script = when (command) {
            "play" -> "window.postMessage({ type: 'ANDROID_AUTO_COMMAND', command: 'play' }, '*');"
            "pause" -> "window.postMessage({ type: 'ANDROID_AUTO_COMMAND', command: 'pause' }, '*');"
            "next" -> "window.postMessage({ type: 'ANDROID_AUTO_COMMAND', command: 'next' }, '*');"
            "previous" -> "window.postMessage({ type: 'ANDROID_AUTO_COMMAND', command: 'previous' }, '*');"
            "seek" -> if (value != null) {
                "window.postMessage({ type: 'ANDROID_AUTO_COMMAND', command: 'seek', value: $value }, '*');"
            } else {
                return
            }
            else -> return
        }
        
        webView.evaluateJavascript(script, null)
    }
    
    // Méthode pour obtenir l'état de lecture actuel
    fun getPlaybackState(callback: (Map<String, Any>?) -> Unit) {
        val script = """
            (function() {
                if (window.playerState) {
                    return JSON.stringify(window.playerState);
                }
                return null;
            })();
        """.trimIndent()
        
        webView.evaluateJavascript(script) { result ->
            try {
                if (result != null && result != "null") {
                    // Parser le résultat JSON
                    val jsonString = result.removeSurrounding("\"")
                        .replace("\\\"", "\"")
                        .replace("\\n", "")
                    // TODO: Utiliser une bibliothèque JSON pour parser correctement
                    // Pour l'instant, retourner null
                    callback(null)
                } else {
                    callback(null)
                }
            } catch (e: Exception) {
                println("❌ Erreur lors du parsing de l'état: ${e.message}")
                callback(null)
            }
        }
    }
    
    // Méthode pour écouter les changements d'état depuis l'application web
    fun setupPlaybackStateListener() {
        val script = """
            (function() {
                // Écouter les événements de changement d'état
                window.addEventListener('message', function(event) {
                    if (event.data && event.data.type === 'PLAYBACK_STATE_CHANGED') {
                        Android.onPlaybackStateChanged(JSON.stringify(event.data.state));
                    }
                });
                
                // Écouter les événements du PlayerContext (si exposé)
                if (window.addEventListener) {
                    window.addEventListener('playerStateChanged', function(event) {
                        Android.onPlaybackStateChanged(JSON.stringify(event.detail));
                    });
                }
            })();
        """.trimIndent()
        
        webView.evaluateJavascript(script, null)
    }
    
    // Méthode appelée depuis JavaScript pour mettre à jour l'état
    @android.webkit.JavascriptInterface
    fun onPlaybackStateChanged(stateJson: String) {
        try {
            // TODO: Parser le JSON et mettre à jour MediaBrowserService
            println("📡 État de lecture reçu: $stateJson")
            // Mettre à jour MediaBrowserService si disponible
            mediaBrowserService?.let { service ->
                // Parser le JSON et mettre à jour les métadonnées
                // Pour l'instant, juste logger
            }
        } catch (e: Exception) {
            println("❌ Erreur lors de la mise à jour de l'état: ${e.message}")
        }
    }
    
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}

