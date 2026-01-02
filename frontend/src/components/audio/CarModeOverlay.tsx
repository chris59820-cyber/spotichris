/**
 * Composant pour appliquer les styles du mode voiture
 */

import React, { useEffect } from 'react'
import { theme } from '../../styles/theme'

interface CarModeOverlayProps {
  isEnabled: boolean
  children: React.ReactNode
}

const CarModeOverlay: React.FC<CarModeOverlayProps> = ({ isEnabled, children }) => {
  useEffect(() => {
    if (isEnabled) {
      // Appliquer les styles du mode voiture
      document.body.classList.add('car-mode-active')
      
      // Ajouter des styles CSS personnalisés
      const style = document.createElement('style')
      style.id = 'car-mode-styles'
      style.textContent = `
        .car-mode-active * {
          font-size: 1.2em !important;
        }
        .car-mode-active button {
          min-height: 48px !important;
          min-width: 48px !important;
          padding: 12px !important;
        }
        .car-mode-active input[type="range"] {
          height: 8px !important;
        }
        .car-mode-active {
          background-color: ${theme.colors.bgPrimary} !important;
          color: ${theme.colors.textPrimary} !important;
        }
      `
      document.head.appendChild(style)
      
      return () => {
        document.body.classList.remove('car-mode-active')
        const existingStyle = document.getElementById('car-mode-styles')
        if (existingStyle) {
          existingStyle.remove()
        }
      }
    } else {
      document.body.classList.remove('car-mode-active')
      const existingStyle = document.getElementById('car-mode-styles')
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [isEnabled])

  return <>{children}</>
}

export default CarModeOverlay







