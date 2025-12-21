/**
 * Composant d'égaliseur audio personnalisable
 */

import React, { useState } from 'react'
import { useEqualizer, EqualizerBand, EqualizerPreset } from '../../hooks/useEqualizer'
import { theme } from '../../styles/theme'
import Button from '../ui/Button'
import Card from '../ui/Card'

interface EqualizerProps {
  audioContext: AudioContext | null
  audioElement: HTMLAudioElement | null
  onClose?: () => void
}

const Equalizer: React.FC<EqualizerProps> = ({
  audioContext,
  audioElement,
  onClose,
}) => {
  const {
    bands,
    isEnabled,
    initialize,
    updateBand,
    applyPreset,
    toggle,
    reset,
    presets,
  } = useEqualizer(audioContext)

  const [selectedPreset, setSelectedPreset] = useState<string>('Flat')

  React.useEffect(() => {
    if (audioElement && audioContext) {
      initialize(audioElement)
    }
  }, [audioElement, audioContext, initialize])

  const handlePresetChange = (presetName: string) => {
    const preset = presets.find((p) => p.name === presetName)
    if (preset) {
      applyPreset(preset)
      setSelectedPreset(presetName)
    }
  }

  const containerStyle: React.CSSProperties = {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.borderPrimary}`,
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  }

  const titleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes.xl,
    fontWeight: 600,
    color: theme.colors.textPrimary,
  }

  const bandsContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgTertiary,
    borderRadius: theme.borderRadius.sm,
    minHeight: '300px',
  }

  const bandStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
  }

  const sliderStyle: React.CSSProperties = {
    writingMode: 'vertical-lr',
    direction: 'btl',
    width: '40px',
    height: '200px',
    cursor: 'pointer',
    accentColor: theme.colors.primary,
  }

  const labelStyle: React.CSSProperties = {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  }

  const frequencyLabelStyle: React.CSSProperties = {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.textTertiary,
    fontWeight: 600,
  }

  const controlsStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  }

  const presetSelectStyle: React.CSSProperties = {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.bgTertiary,
    border: `1px solid ${theme.colors.borderPrimary}`,
    borderRadius: theme.borderRadius.sm,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.sm,
    cursor: 'pointer',
  }

  const formatFrequency = (freq: number): string => {
    if (freq >= 1000) {
      return `${(freq / 1000).toFixed(1)}k`
    }
    return freq.toString()
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Égaliseur Audio</h3>
        {onClose && (
          <Button variant="secondary" size="sm" onClick={onClose}>
            ✕
          </Button>
        )}
      </div>

      <div style={controlsStyle}>
        <Button
          variant={isEnabled ? 'primary' : 'secondary'}
          size="sm"
          onClick={toggle}
        >
          {isEnabled ? 'Désactiver' : 'Activer'}
        </Button>
        <Button variant="secondary" size="sm" onClick={reset}>
          Réinitialiser
        </Button>
        <select
          style={presetSelectStyle}
          value={selectedPreset}
          onChange={(e) => handlePresetChange(e.target.value)}
        >
          {presets.map((preset) => (
            <option key={preset.name} value={preset.name}>
              {preset.name}
            </option>
          ))}
        </select>
      </div>

      <div style={bandsContainerStyle}>
        {bands.map((band, index) => (
          <div key={index} style={bandStyle}>
            <input
              type="range"
              min="-12"
              max="12"
              step="0.5"
              value={band.gain}
              onChange={(e) => updateBand(index, parseFloat(e.target.value))}
              style={sliderStyle}
              disabled={!isEnabled}
            />
            <div style={labelStyle}>
              <div style={frequencyLabelStyle}>
                {formatFrequency(band.frequency)}
              </div>
              <div>{band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)} dB</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Equalizer

