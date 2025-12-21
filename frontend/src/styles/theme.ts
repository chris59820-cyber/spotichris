// Thème sombre (par défaut)
const darkTheme = {
  colors: {
    // Cyberpunk palette
    primary: '#00ff41', // Néon vert
    primaryDark: '#00cc33',
    primaryLight: '#33ff66',
    secondary: '#ff00ff', // Néon magenta
    secondaryDark: '#cc00cc',
    accent: '#00ffff', // Cyan
    accentDark: '#00cccc',
    
    // Backgrounds
    bgPrimary: '#0a0a0a',
    bgSecondary: '#1a1a1a',
    bgTertiary: '#2a2a2a',
    bgHover: '#333333',
    
    // Text
    textPrimary: '#ffffff',
    textSecondary: '#b0b0b0',
    textTertiary: '#808080',
    textInverse: '#000000',
    
    // Borders
    borderPrimary: '#333333',
    borderSecondary: '#404040',
    borderAccent: '#00ff41',
    
    // States
    success: '#00ff41',
    error: '#ff0040',
    warning: '#ffaa00',
    info: '#00aaff',
    
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #00ff41 0%, #00ffff 100%)',
    gradientSecondary: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 100%)',
    gradientBg: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
  },
}

// Thème clair
const lightTheme = {
  colors: {
    // Cyberpunk palette (adaptée pour le mode clair)
    primary: '#00cc33', // Vert plus foncé pour le contraste
    primaryDark: '#009922',
    primaryLight: '#00ff41',
    secondary: '#cc00cc', // Magenta plus foncé
    secondaryDark: '#990099',
    accent: '#0099cc', // Cyan plus foncé
    accentDark: '#006699',
    
    // Backgrounds
    bgPrimary: '#ffffff',
    bgSecondary: '#f5f5f5',
    bgTertiary: '#e8e8e8',
    bgHover: '#d0d0d0',
    
    // Text
    textPrimary: '#000000',
    textSecondary: '#4a4a4a',
    textTertiary: '#6a6a6a',
    textInverse: '#ffffff',
    
    // Borders
    borderPrimary: '#d0d0d0',
    borderSecondary: '#b0b0b0',
    borderAccent: '#00cc33',
    
    // States
    success: '#00cc33',
    error: '#cc0000',
    warning: '#cc8800',
    info: '#0066cc',
    
    // Gradients
    gradientPrimary: 'linear-gradient(135deg, #00cc33 0%, #0099cc 100%)',
    gradientSecondary: 'linear-gradient(135deg, #cc00cc 0%, #0099cc 100%)',
    gradientBg: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)',
  },
}

// Fonction pour obtenir le thème actuel
const getTheme = () => {
  if (typeof document !== 'undefined') {
    const themeMode = document.documentElement.getAttribute('data-theme')
    return themeMode === 'light' ? lightTheme : darkTheme
  }
  return darkTheme
}

// Thème par défaut (sera remplacé dynamiquement par le contexte)
export const theme = {
  ...darkTheme,
  // Cette fonction sera mise à jour dynamiquement
  get colors() {
    return getTheme().colors
  },
  
  fonts: {
    primary: '"Inter", system-ui, sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },
  
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 2px 4px rgba(0, 255, 65, 0.1)',
    md: '0 4px 8px rgba(0, 255, 65, 0.15)',
    lg: '0 8px 16px rgba(0, 255, 65, 0.2)',
    glow: '0 0 20px rgba(0, 255, 65, 0.5)',
    glowStrong: '0 0 30px rgba(0, 255, 65, 0.8)',
  },
  
  transitions: {
    fast: '150ms ease',
    base: '250ms ease',
    slow: '350ms ease',
  },
  
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
}

// Exporter les thèmes individuels pour référence
export { darkTheme, lightTheme }

export type Theme = typeof theme

