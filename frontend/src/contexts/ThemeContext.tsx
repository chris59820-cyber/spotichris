import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { darkTheme, lightTheme } from '../styles/theme'

export type ThemeMode = 'dark' | 'light'

interface ThemeContextType {
  mode: ThemeMode
  theme: typeof darkTheme
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Charger le thème depuis localStorage ou utiliser 'dark' par défaut
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('themeMode')
    if (saved === 'light' || saved === 'dark') {
      return saved
    }
    // Détecter la préférence système
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
    return 'dark'
  })

  // Appliquer le thème au document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
    localStorage.setItem('themeMode', mode)
  }, [mode])

  // Écouter les changements de préférence système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
    const handleChange = (e: MediaQueryListEvent) => {
      // Ne changer que si l'utilisateur n'a pas défini de préférence manuelle
      const saved = localStorage.getItem('themeMode')
      if (!saved) {
        setMode(e.matches ? 'light' : 'dark')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode)
  }

  // Obtenir le thème actuel
  const currentTheme = useMemo(() => {
    return mode === 'light' ? lightTheme : darkTheme
  }, [mode])

  return (
    <ThemeContext.Provider value={{ mode, theme: currentTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

