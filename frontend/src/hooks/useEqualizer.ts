/**
 * Hook pour gérer l'égaliseur audio personnalisable
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { createBiquadFilter } from '../utils/audioFilters'

export interface EqualizerBand {
  frequency: number // Fréquence en Hz
  gain: number // Gain en dB (-12 à +12)
  q: number // Facteur de qualité (0.1 à 10)
}

export interface EqualizerPreset {
  name: string
  bands: EqualizerBand[]
}

// Bandes de fréquences standard pour l'égaliseur
export const DEFAULT_EQUALIZER_BANDS: EqualizerBand[] = [
  { frequency: 60, gain: 0, q: 1 }, // Sub-bass
  { frequency: 170, gain: 0, q: 1 }, // Bass
  { frequency: 310, gain: 0, q: 1 }, // Low midrange
  { frequency: 600, gain: 0, q: 1 }, // Midrange
  { frequency: 1000, gain: 0, q: 1 }, // Upper midrange
  { frequency: 3000, gain: 0, q: 1 }, // Presence
  { frequency: 6000, gain: 0, q: 1 }, // Brilliance
  { frequency: 12000, gain: 0, q: 1 }, // Air
  { frequency: 14000, gain: 0, q: 1 }, // High
  { frequency: 16000, gain: 0, q: 1 }, // Ultra high
]

// Presets prédéfinis
export const EQUALIZER_PRESETS: EqualizerPreset[] = [
  {
    name: 'Flat',
    bands: DEFAULT_EQUALIZER_BANDS.map((band) => ({ ...band, gain: 0 })),
  },
  {
    name: 'Bass Boost',
    bands: DEFAULT_EQUALIZER_BANDS.map((band) => ({
      ...band,
      gain: band.frequency < 200 ? 6 : band.frequency < 500 ? 3 : 0,
    })),
  },
  {
    name: 'Treble Boost',
    bands: DEFAULT_EQUALIZER_BANDS.map((band) => ({
      ...band,
      gain: band.frequency > 5000 ? 6 : band.frequency > 2000 ? 3 : 0,
    })),
  },
  {
    name: 'Vocal Boost',
    bands: DEFAULT_EQUALIZER_BANDS.map((band) => ({
      ...band,
      gain:
        band.frequency >= 1000 && band.frequency <= 3000
          ? 4
          : band.frequency >= 500 && band.frequency <= 5000
          ? 2
          : 0,
    })),
  },
  {
    name: 'Rock',
    bands: DEFAULT_EQUALIZER_BANDS.map((band) => ({
      ...band,
      gain:
        band.frequency < 200
          ? 4
          : band.frequency >= 200 && band.frequency < 1000
          ? 2
          : band.frequency >= 2000 && band.frequency < 6000
          ? 3
          : 0,
    })),
  },
  {
    name: 'Jazz',
    bands: DEFAULT_EQUALIZER_BANDS.map((band) => ({
      ...band,
      gain:
        band.frequency < 200
          ? 2
          : band.frequency >= 200 && band.frequency < 1000
          ? 3
          : band.frequency >= 2000 && band.frequency < 8000
          ? 2
          : 0,
    })),
  },
  {
    name: 'Classical',
    bands: DEFAULT_EQUALIZER_BANDS.map((band) => ({
      ...band,
      gain:
        band.frequency < 200
          ? 1
          : band.frequency >= 200 && band.frequency < 1000
          ? 2
          : band.frequency >= 2000 && band.frequency < 10000
          ? 3
          : 0,
    })),
  },
  {
    name: 'Electronic',
    bands: DEFAULT_EQUALIZER_BANDS.map((band) => ({
      ...band,
      gain:
        band.frequency < 200
          ? 6
          : band.frequency >= 200 && band.frequency < 1000
          ? 4
          : band.frequency >= 5000 && band.frequency < 12000
          ? 3
          : 0,
    })),
  },
]

export const useEqualizer = (audioContext: AudioContext | null) => {
  const [bands, setBands] = useState<EqualizerBand[]>(DEFAULT_EQUALIZER_BANDS)
  const [isEnabled, setIsEnabled] = useState(true)
  const filtersRef = useRef<BiquadFilterNode[]>([])
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  // Initialiser l'égaliseur avec un élément audio
  const initialize = useCallback(
    (audioElement: HTMLAudioElement) => {
      if (!audioContext) return

      try {
        // Créer un MediaElementAudioSourceNode
        const source = audioContext.createMediaElementSource(audioElement)
        sourceNodeRef.current = source

        // Créer un gain node pour le volume global
        const gainNode = audioContext.createGain()
        gainNodeRef.current = gainNode

        // Créer les filtres pour chaque bande
        filtersRef.current = bands.map((band) => {
          const filter = audioContext.createBiquadFilter()
          filter.type = 'peaking'
          filter.frequency.value = band.frequency
          filter.gain.value = isEnabled ? band.gain : 0
          filter.Q.value = band.q
          return filter
        })

        // Connecter les nœuds : source -> filters -> gain -> destination
        let currentNode: AudioNode = source
        filtersRef.current.forEach((filter) => {
          currentNode.connect(filter)
          currentNode = filter
        })
        currentNode.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Prévenir l'erreur "multiple connections"
        audioElement.setAttribute('data-equalizer-initialized', 'true')
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'égaliseur:', error)
      }
    },
    [audioContext, bands, isEnabled]
  )

  // Mettre à jour une bande spécifique
  const updateBand = useCallback(
    (index: number, gain: number) => {
      if (index < 0 || index >= bands.length) return

      const newBands = [...bands]
      newBands[index] = { ...newBands[index], gain }
      setBands(newBands)

      // Mettre à jour le filtre correspondant
      if (filtersRef.current[index]) {
        filtersRef.current[index].gain.value = isEnabled ? gain : 0
      }
    },
    [bands, isEnabled]
  )

  // Appliquer un preset
  const applyPreset = useCallback(
    (preset: EqualizerPreset) => {
      setBands(preset.bands)
      // Mettre à jour tous les filtres
      preset.bands.forEach((band, index) => {
        if (filtersRef.current[index]) {
          filtersRef.current[index].frequency.value = band.frequency
          filtersRef.current[index].gain.value = isEnabled ? band.gain : 0
          filtersRef.current[index].Q.value = band.q
        }
      })
    },
    [isEnabled]
  )

  // Activer/désactiver l'égaliseur
  const toggle = useCallback(() => {
    setIsEnabled((prev) => {
      const newValue = !prev
      // Mettre à jour tous les filtres
      filtersRef.current.forEach((filter, index) => {
        filter.gain.value = newValue ? bands[index].gain : 0
      })
      return newValue
    })
  }, [bands])

  // Réinitialiser toutes les bandes à 0
  const reset = useCallback(() => {
    const flatBands = bands.map((band) => ({ ...band, gain: 0 }))
    setBands(flatBands)
    filtersRef.current.forEach((filter, index) => {
      filter.gain.value = 0
    })
  }, [bands])

  // Nettoyer les connexions
  const cleanup = useCallback(() => {
    filtersRef.current.forEach((filter) => {
      try {
        filter.disconnect()
      } catch (e) {
        // Ignorer les erreurs de déconnexion
      }
    })
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect()
      } catch (e) {
        // Ignorer les erreurs de déconnexion
      }
    }
    if (gainNodeRef.current) {
      try {
        gainNodeRef.current.disconnect()
      } catch (e) {
        // Ignorer les erreurs de déconnexion
      }
    }
    filtersRef.current = []
    sourceNodeRef.current = null
    gainNodeRef.current = null
  }, [])

  return {
    bands,
    isEnabled,
    initialize,
    updateBand,
    applyPreset,
    toggle,
    reset,
    cleanup,
    presets: EQUALIZER_PRESETS,
  }
}

