/**
 * Hook pour gérer le crossfade (transition en fondu) entre les morceaux
 */

import { useRef, useEffect, useCallback } from 'react'

export interface CrossfadeOptions {
  duration: number // Durée du crossfade en secondes (par défaut: 3)
  fadeIn: boolean // Activer le fade-in au début
  fadeOut: boolean // Activer le fade-out à la fin
}

const DEFAULT_CROSSFADE_OPTIONS: CrossfadeOptions = {
  duration: 3,
  fadeIn: true,
  fadeOut: true,
}

export const useCrossfade = (
  audioElement: HTMLAudioElement | null,
  isPlaying: boolean,
  options: Partial<CrossfadeOptions> = {}
) => {
  const crossfadeOptions = { ...DEFAULT_CROSSFADE_OPTIONS, ...options }
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isFadingRef = useRef(false)

  // Fonction pour effectuer un fade-in
  const fadeIn = useCallback(
    (targetVolume: number = 1.0) => {
      if (!audioElement || isFadingRef.current) return

      isFadingRef.current = true
      const steps = 30 // Nombre d'étapes pour le fade
      const stepDuration = (crossfadeOptions.duration * 1000) / steps
      const volumeStep = targetVolume / steps
      let currentStep = 0

      audioElement.volume = 0

      fadeIntervalRef.current = setInterval(() => {
        currentStep++
        const newVolume = Math.min(volumeStep * currentStep, targetVolume)

        if (audioElement) {
          audioElement.volume = newVolume
        }

        if (currentStep >= steps) {
          if (audioElement) {
            audioElement.volume = targetVolume
          }
          isFadingRef.current = false
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current)
            fadeIntervalRef.current = null
          }
        }
      }, stepDuration)
    },
    [audioElement, crossfadeOptions.duration]
  )

  // Fonction pour effectuer un fade-out
  const fadeOut = useCallback(
    (onComplete?: () => void) => {
      if (!audioElement || isFadingRef.current) return

      isFadingRef.current = true
      const initialVolume = audioElement.volume
      const steps = 30
      const stepDuration = (crossfadeOptions.duration * 1000) / steps
      const volumeStep = initialVolume / steps
      let currentStep = 0

      fadeIntervalRef.current = setInterval(() => {
        currentStep++
        const newVolume = Math.max(initialVolume - volumeStep * currentStep, 0)

        if (audioElement) {
          audioElement.volume = newVolume
        }

        if (currentStep >= steps || newVolume <= 0) {
          if (audioElement) {
            audioElement.volume = 0
          }
          isFadingRef.current = false
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current)
            fadeIntervalRef.current = null
          }
          if (onComplete) {
            onComplete()
          }
        }
      }, stepDuration)
    },
    [audioElement, crossfadeOptions.duration]
  )

  // Fonction pour effectuer un crossfade (fade-out du premier, fade-in du second)
  const crossfade = useCallback(
    (
      currentAudio: HTMLAudioElement,
      nextAudio: HTMLAudioElement,
      onComplete?: () => void
    ) => {
      if (isFadingRef.current) return

      const initialNextVolume = nextAudio.volume
      nextAudio.volume = 0
      nextAudio.play()

      const steps = 30
      const stepDuration = (crossfadeOptions.duration * 1000) / steps
      const currentInitialVolume = currentAudio.volume
      const currentVolumeStep = currentInitialVolume / steps
      const nextVolumeStep = initialNextVolume / steps
      let currentStep = 0

      isFadingRef.current = true

      fadeIntervalRef.current = setInterval(() => {
        currentStep++

        // Fade-out du morceau actuel
        const currentNewVolume = Math.max(
          currentInitialVolume - currentVolumeStep * currentStep,
          0
        )
        currentAudio.volume = currentNewVolume

        // Fade-in du morceau suivant
        const nextNewVolume = Math.min(
          nextVolumeStep * currentStep,
          initialNextVolume
        )
        nextAudio.volume = nextNewVolume

        if (currentStep >= steps) {
          currentAudio.volume = 0
          currentAudio.pause()
          nextAudio.volume = initialNextVolume
          isFadingRef.current = false
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current)
            fadeIntervalRef.current = null
          }
          if (onComplete) {
            onComplete()
          }
        }
      }, stepDuration)
    },
    [crossfadeOptions.duration]
  )

  // Appliquer fade-in au démarrage si activé
  useEffect(() => {
    if (
      audioElement &&
      isPlaying &&
      crossfadeOptions.fadeIn &&
      !isFadingRef.current
    ) {
      fadeIn()
    }
  }, [audioElement, isPlaying, crossfadeOptions.fadeIn, fadeIn])

  // Nettoyer les intervalles au démontage
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current)
      }
    }
  }, [])

  return {
    fadeIn,
    fadeOut,
    crossfade,
    isFading: isFadingRef.current,
  }
}






