// Configuration de l'URL de l'API
// En développement, utilise le proxy Vite (/api)
// En production, utilise VITE_API_URL ou l'URL par défaut
export const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

// URL complète pour les WebSockets et autres connexions directes
export const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin)

// URL WebSocket pour Socket.IO
export const WS_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin)

