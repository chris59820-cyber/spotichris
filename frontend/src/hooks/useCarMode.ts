/**
 * Hook pour gérer le mode voiture optimisé
 */

import { useState, useEffect, useCallback } from 'react'

export interface CarModeSettings {
  enabled: boolean
  largeButtons: boolean
  voiceCommands: boolean
  autoPlay: boolean
  simplifiedUI: boolean
  highContrast: boolean
}

const DEFAULT_CAR_MODE_SETTINGS: CarModeSettings = {
  enabled: false,
  largeButtons: true,
  voiceCommands: false,
  autoPlay: false,
  simplifiedUI: true,
  highContrast: true,
}

export const useCarMode = () => {
  const [settings, setSettings] = useState<CarModeSettings>(
    () => {
      const saved = localStorage.getItem('carModeSettings')
      return saved ? JSON.parse(saved) : DEFAULT_CAR_MODE_SETTINGS
    }
  )

  // Sauvegarder les paramètres dans localStorage
  useEffect(() => {
    localStorage.setItem('carModeSettings', JSON.stringify(settings))
  }, [settings])

  // Détecter si l'appareil est en mode voiture (via User-Agent ou API)
  useEffect(() => {
    // Détection basique via User-Agent (peut être améliorée)
    const isCarDevice =
      navigator.userAgent.includes('CarPlay') ||
      navigator.userAgent.includes('AndroidAuto') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches

    if (isCarDevice && !settings.enabled) {
      // Auto-activer le mode voiture si détecté
      setSettings((prev) => ({ ...prev, enabled: true }))
    }
  }, [settings.enabled])

  const toggle = useCallback(() => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))
  }, [])

  const updateSetting = useCallback(
    <K extends keyof CarModeSettings>(
      key: K,
      value: CarModeSettings[K]
    ) => {
      setSettings((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  return {
    settings,
    toggle,
    updateSetting,
    isEnabled: settings.enabled,
  }
}

