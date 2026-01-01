package com.spotichris

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat

/**
 * Service de notification pour la lecture en arrière-plan
 * Nécessaire pour Android Auto et la lecture en arrière-plan
 */
class MediaPlaybackService : Service() {
    
    private val channelId = "spotichris_media_channel"
    private val notificationId = 1
    
    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }
    
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_PLAY -> {
                // Démarrer la lecture
                startForeground(notificationId, createNotification("Lecture en cours"))
            }
            ACTION_PAUSE -> {
                // Mettre en pause
                updateNotification("En pause")
            }
            ACTION_STOP -> {
                // Arrêter
                stopForeground(true)
                stopSelf()
            }
        }
        return START_STICKY
    }
    
    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Spotichris Media",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Notification pour la lecture média"
                setShowBadge(false)
            }
            
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    private fun createNotification(text: String): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("Spotichris")
            .setContentText(text)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }
    
    private fun updateNotification(text: String) {
        val notificationManager = getSystemService(NotificationManager::class.java)
        notificationManager.notify(notificationId, createNotification(text))
    }
    
    companion object {
        const val ACTION_PLAY = "com.spotichris.ACTION_PLAY"
        const val ACTION_PAUSE = "com.spotichris.ACTION_PAUSE"
        const val ACTION_STOP = "com.spotichris.ACTION_STOP"
    }
}






