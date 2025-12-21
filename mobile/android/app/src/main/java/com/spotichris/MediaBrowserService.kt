package com.spotichris

import android.content.Intent
import android.media.MediaMetadata
import android.media.browse.MediaBrowser
import android.media.session.MediaSession
import android.media.session.PlaybackState
import android.os.Bundle
import android.os.IBinder
import android.service.media.MediaBrowserService
import androidx.core.content.ContextCompat

/**
 * Service MediaBrowser pour Android Auto
 * Gère la communication entre Android Auto et l'application
 */
class SpotichrisMediaBrowserService : MediaBrowserService() {
    
    private lateinit var mediaSession: MediaSession
    private var mainActivity: MainActivity? = null
    private val rootId = "root"
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialiser la MediaSession
        mediaSession = MediaSession(this, "SpotichrisMediaSession")
        setSessionToken(mediaSession.sessionToken)
        
        // Configurer les callbacks
        mediaSession.setCallback(object : MediaSession.Callback() {
            override fun onPlay() {
                mainActivity?.handleAndroidAutoCommand("play")
                updatePlaybackState(PlaybackState.STATE_PLAYING)
            }
            
            override fun onPause() {
                mainActivity?.handleAndroidAutoCommand("pause")
                updatePlaybackState(PlaybackState.STATE_PAUSED)
            }
            
            override fun onStop() {
                updatePlaybackState(PlaybackState.STATE_STOPPED)
            }
            
            override fun onSkipToNext() {
                mainActivity?.handleAndroidAutoCommand("next")
            }
            
            override fun onSkipToPrevious() {
                mainActivity?.handleAndroidAutoCommand("previous")
            }
            
            override fun onSeekTo(pos: Long) {
                mainActivity?.handleAndroidAutoCommand("seek", pos / 1000.0)
            }
            
            override fun onFastForward() {
                mainActivity?.handleAndroidAutoCommand("seek", 10.0)
            }
            
            override fun onRewind() {
                mainActivity?.handleAndroidAutoCommand("seek", -10.0)
            }
            
            override fun onSetPlaybackSpeed(speed: Float): Boolean {
                // Gérer le changement de vitesse de lecture si nécessaire
                return true
            }
        })
        
        // Activer la session
        mediaSession.isActive = true
        
        println("✅ MediaBrowserService créé")
    }
    
    override fun onGetRoot(clientPackageName: String, clientUid: Int, rootHints: Bundle?): BrowserRoot? {
        // Vérifier que le client est autorisé (Android Auto, etc.)
        // En production, vérifier le package name
        if (clientPackageName.contains("android.auto") || 
            clientPackageName == packageName ||
            clientPackageName.contains("com.google.android.projection.gearhead")) {
            return BrowserRoot(rootId, null)
        }
        return null
    }
    
    override fun onLoadChildren(parentId: String, result: Result<List<MediaBrowser.MediaItem>>) {
        when (parentId) {
            rootId -> {
                // Charger les éléments racine
                val items = loadRootItems()
                result.sendResult(items)
            }
            "favorites" -> {
                // Charger les favoris
                val items = loadFavorites()
                result.sendResult(items)
            }
            "playlists" -> {
                // Charger les playlists
                val items = loadPlaylists()
                result.sendResult(items)
            }
            "recent" -> {
                // Charger la musique récente
                val items = loadRecentMusic()
                result.sendResult(items)
            }
            else -> {
                // Charger les enfants d'un élément spécifique
                result.sendResult(emptyList())
            }
        }
    }
    
    private fun loadRootItems(): List<MediaBrowser.MediaItem> {
        return listOf(
            createMediaItem("favorites", "Mes favoris", MediaBrowser.MediaItem.FLAG_BROWSABLE),
            createMediaItem("playlists", "Mes playlists", MediaBrowser.MediaItem.FLAG_BROWSABLE),
            createMediaItem("recent", "Musique récente", MediaBrowser.MediaItem.FLAG_BROWSABLE),
        )
    }
    
    private fun loadFavorites(): List<MediaBrowser.MediaItem> {
        // TODO: Charger les favoris depuis l'API
        return emptyList()
    }
    
    private fun loadPlaylists(): List<MediaBrowser.MediaItem> {
        // TODO: Charger les playlists depuis l'API
        return emptyList()
    }
    
    private fun loadRecentMusic(): List<MediaBrowser.MediaItem> {
        // TODO: Charger la musique récente depuis l'API
        return emptyList()
    }
    
    private fun createMediaItem(
        mediaId: String,
        title: String,
        flags: Int
    ): MediaBrowser.MediaItem {
        val description = android.media.MediaMetadata.Builder()
            .putString(MediaMetadata.METADATA_KEY_MEDIA_ID, mediaId)
            .putString(MediaMetadata.METADATA_KEY_TITLE, title)
            .build()
            .description
        
        return MediaBrowser.MediaItem(description, flags)
    }
    
    // Mettre à jour les métadonnées du média
    fun updateMetadata(
        title: String,
        artist: String,
        album: String,
        duration: Long,
        artwork: android.graphics.Bitmap? = null
    ) {
        val metadata = MediaMetadata.Builder()
            .putString(MediaMetadata.METADATA_KEY_TITLE, title)
            .putString(MediaMetadata.METADATA_KEY_ARTIST, artist)
            .putString(MediaMetadata.METADATA_KEY_ALBUM, album)
            .putLong(MediaMetadata.METADATA_KEY_DURATION, duration)
            .putString(MediaMetadata.METADATA_KEY_MEDIA_ID, "current")
        
        if (artwork != null) {
            metadata.putBitmap(MediaMetadata.METADATA_KEY_ART, artwork)
        }
        
        mediaSession.setMetadata(metadata.build())
    }
    
    // Mettre à jour l'état de lecture
    fun updatePlaybackState(
        state: Int,
        position: Long = 0,
        speed: Float = 1.0f,
        actions: Long = getDefaultActions()
    ) {
        val playbackState = PlaybackState.Builder()
            .setState(state, position, speed)
            .setActions(actions)
            .build()
        
        mediaSession.setPlaybackState(playbackState)
    }
    
    private fun getDefaultActions(): Long {
        return PlaybackState.ACTION_PLAY
            or PlaybackState.ACTION_PAUSE
            or PlaybackState.ACTION_SKIP_TO_NEXT
            or PlaybackState.ACTION_SKIP_TO_PREVIOUS
            or PlaybackState.ACTION_SEEK_TO
            or PlaybackState.ACTION_FAST_FORWARD
            or PlaybackState.ACTION_REWIND
            or PlaybackState.ACTION_SET_PLAYBACK_SPEED
    }
    
    override fun onDestroy() {
        super.onDestroy()
        mediaSession.release()
        instance = null
        println("❌ MediaBrowserService détruit")
    }
    
    override fun onBind(intent: Intent?): IBinder? {
        return super.onBind(intent)
    }
    
    fun setMainActivity(activity: MainActivity) {
        this.mainActivity = activity
    }
    
    companion object {
        // Instance singleton pour accès depuis MainActivity
        @Volatile
        private var instance: SpotichrisMediaBrowserService? = null
        
        fun getInstance(): SpotichrisMediaBrowserService? {
            return instance
        }
    }
    
    init {
        instance = this
    }
}
