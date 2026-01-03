package com.spotichris

import android.app.Application

/**
 * Classe Application pour Spotichris
 * Initialise les services globaux
 */
class SpotichrisApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        println("✅ SpotichrisApplication créé")
    }
}








