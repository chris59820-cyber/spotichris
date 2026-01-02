/**
 * Utilitaires pour gérer les URLs des médias
 */

/**
 * Convertit une URL absolue en URL relative pour utiliser le proxy Vite
 * @param url L'URL à normaliser (peut être absolue ou relative)
 * @returns URL relative commençant par /
 */
export function normalizeMediaUrl(url: string | undefined | null): string {
  if (!url) return ''
  
  // Si c'est une URL absolue (http://localhost:3000/uploads/...), convertir en relative
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const urlObj = new URL(url)
      // Retourner le pathname pour utiliser le proxy Vite
      return urlObj.pathname
    } catch {
      return url
    }
  }
  
  // Si c'est une URL relative commençant par /, l'utiliser telle quelle
  if (url.startsWith('/')) {
    return url
  }
  
  // Sinon, préfixer avec /uploads/
  return `/uploads/${url}`
}







