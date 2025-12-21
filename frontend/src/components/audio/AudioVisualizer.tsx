import React, { useEffect, useRef, useState } from 'react'
import { theme } from '../../styles/theme'

interface AudioVisualizerProps {
  audioElement: HTMLAudioElement | null
  audioContext?: AudioContext | null
  isPlaying: boolean
  width?: number
  height?: number
  barCount?: number
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioElement,
  audioContext: externalAudioContext,
  isPlaying,
  width = 300,
  height = 60,
  barCount = 30,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialiser l'analyseur audio
  useEffect(() => {
    if (!audioElement) return

    // Réinitialiser si l'élément audio change
    setIsInitialized(false)
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect()
      } catch (e) {
        // Ignorer les erreurs
      }
      sourceRef.current = null
    }
    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect()
      } catch (e) {
        // Ignorer les erreurs
      }
      analyserRef.current = null
    }

    const initAudioContext = async () => {
      try {
        if (!audioElement) return

        // Utiliser l'AudioContext externe si fourni, sinon en créer un nouveau
        if (!audioContextRef.current) {
          audioContextRef.current = externalAudioContext || new (window.AudioContext || (window as any).webkitAudioContext)()
        }

        const audioContext = audioContextRef.current

        // Reprendre l'AudioContext s'il est suspendu
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
        }

        // Créer l'analyseur
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 512
        analyser.smoothingTimeConstant = 0.7
        analyserRef.current = analyser

        // Essayer de créer une source depuis l'élément audio
        // IMPORTANT: Cette opération doit être faite AVANT que l'audio commence à jouer
        try {
          sourceRef.current = audioContext.createMediaElementSource(audioElement)
          
          // Créer un GainNode pour splitter le signal
          const splitter = audioContext.createGain()
          splitter.gain.value = 1.0
          
          // Connecter la source au splitter
          sourceRef.current.connect(splitter)
          
          // Connecter une sortie du splitter à l'analyseur
          splitter.connect(analyser)
          
          // Connecter l'autre sortie du splitter à la destination (pour le son)
          splitter.connect(audioContext.destination)
          
          setIsInitialized(true)
          console.log('AudioVisualizer: Initialized successfully', { audioElement, isPlaying })
        } catch (error: any) {
          // Si l'erreur indique que l'élément a déjà une source
          if (error.message && (error.message.includes('already connected') || error.message.includes('InvalidStateError'))) {
            console.warn('AudioVisualizer: Audio element already has a source, trying alternative approach', error)
            // Essayer de se connecter via window.equalizerGainNode si disponible
            if ((window as any).equalizerGainNode && analyserRef.current) {
              try {
                (window as any).equalizerGainNode.connect(analyserRef.current)
                analyserRef.current.connect(audioContext.destination)
                setIsInitialized(true)
                console.log('AudioVisualizer: Connected via equalizer gain node')
              } catch (e) {
                console.error('AudioVisualizer: Failed to connect via equalizer gain node', e)
                setIsInitialized(false)
              }
            } else {
              setIsInitialized(false)
            }
            return
          } else {
            console.error('AudioVisualizer: Error creating source:', error)
            setIsInitialized(false)
            return
          }
        }
      } catch (error) {
        console.error('Error initializing audio visualizer:', error)
        setIsInitialized(false)
      }
    }

    // Initialiser immédiatement, sans attendre que l'audio joue
    // Cela permet de créer la source avant que l'audio commence
    initAudioContext()

    return () => {
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect()
        } catch (e) {
          // Ignorer les erreurs de déconnexion
        }
        sourceRef.current = null
      }
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect()
        } catch (e) {
          // Ignorer les erreurs de déconnexion
        }
        analyserRef.current = null
      }
      setIsInitialized(false)
    }
  }, [audioElement, isInitialized, externalAudioContext])

  // Animer la visualisation
  useEffect(() => {
    // Si l'égaliseur graphique n'est pas initialisé, ne pas bloquer
    if (!isInitialized || !analyserRef.current || !canvasRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      // Afficher un message de débogage
      if (!isInitialized) {
        console.log('AudioVisualizer: Not initialized yet', { isInitialized, hasAnalyser: !!analyserRef.current, hasCanvas: !!canvasRef.current })
      }
      return
    }
    
    // Ne pas animer si la musique n'est pas en cours de lecture
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      // Effacer le canvas quand la musique est en pause
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (ctx) {
        ctx.fillStyle = theme.colors.bgTertiary || 'rgba(0, 0, 0, 0.3)'
        ctx.fillRect(0, 0, width, height)
      }
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('AudioVisualizer: Cannot get canvas context')
      return
    }

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    console.log('AudioVisualizer: Starting animation', { isInitialized, isPlaying, bufferLength, width, height })

    const draw = () => {
      if (!isPlaying || !ctx || !analyserRef.current) {
        animationFrameRef.current = null
        return
      }

      // Obtenir les données de fréquence
      analyserRef.current.getByteFrequencyData(dataArray)

      // Effacer le canvas avec un fond sombre
      ctx.fillStyle = theme.colors.bgTertiary || 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(0, 0, width, height)

      // Calculer la largeur et l'espacement des barres
      const barWidth = (width / barCount) * 0.85
      const barSpacing = (width / barCount) * 0.15
      const maxBarHeight = height * 0.95

      // Dessiner les barres
      for (let i = 0; i < barCount; i++) {
        // Mapper l'index de la barre aux données de fréquence
        const dataIndex = Math.floor((i / barCount) * bufferLength)
        const rawValue = dataArray[dataIndex]
        // Amplifier les valeurs pour une meilleure visibilité
        const amplifiedValue = Math.min(255, rawValue * 1.5)
        const barHeight = Math.max(2, (amplifiedValue / 255) * maxBarHeight) // Minimum 2px pour visibilité

        // Position X de la barre
        const x = i * (barWidth + barSpacing) + barSpacing / 2

        // Couleur basée sur la position (effet arc-en-ciel)
        const hue = (i / barCount) * 360
        const saturation = 80
        const lightness = 50 + (barHeight / maxBarHeight) * 30

        // Dessiner la barre avec un dégradé
        const gradient = ctx.createLinearGradient(x, height, x, height - barHeight)
        gradient.addColorStop(0, `hsl(${hue}, ${saturation}%, ${lightness}%)`)
        gradient.addColorStop(1, `hsl(${hue}, ${saturation}%, ${lightness + 20}%)`)

        ctx.fillStyle = gradient
        ctx.fillRect(x, height - barHeight, barWidth, barHeight)

        // Ajouter un effet de brillance en haut
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness + 30}%, 0.4)`
        ctx.fillRect(x, height - barHeight, barWidth, Math.min(barHeight * 0.2, 3))
      }

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [isInitialized, isPlaying, width, height, barCount])

  // Réinitialiser quand l'élément audio change
  useEffect(() => {
    setIsInitialized(false)
    sourceRef.current = null
    analyserRef.current = null
  }, [audioElement])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: theme.colors.bgTertiary || 'rgba(0, 0, 0, 0.3)',
        display: 'block',
      }}
    />
  )
}

export default AudioVisualizer

