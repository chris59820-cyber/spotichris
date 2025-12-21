import axios from 'axios'

const API_URL = '/api'

class FavoritesService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
  }

  /**
   * Basculer le statut favori d'un média
   */
  async toggleFavorite(mediaId: number): Promise<{ is_favorite: boolean }> {
    const response = await axios.post(
      `${API_URL}/favorites/${mediaId}`,
      {},
      this.getAuthHeaders()
    )
    return response.data
  }

  /**
   * Récupérer le statut favori d'un média
   */
  async getFavoriteStatus(mediaId: number): Promise<{ is_favorite: boolean }> {
    const response = await axios.get(
      `${API_URL}/favorites/${mediaId}`,
      this.getAuthHeaders()
    )
    return response.data
  }

  /**
   * Récupérer les statuts favoris pour plusieurs médias
   */
  async getFavoriteStatuses(mediaIds: number[]): Promise<Record<number, boolean>> {
    if (mediaIds.length === 0) {
      return {}
    }

    const response = await axios.get(
      `${API_URL}/favorites/status/batch?mediaIds=${mediaIds.join(',')}`,
      this.getAuthHeaders()
    )
    return response.data
  }

  /**
   * Récupérer tous les favoris de l'utilisateur avec les détails des médias
   */
  async getUserFavorites(): Promise<any[]> {
    const response = await axios.get(
      `${API_URL}/favorites`,
      this.getAuthHeaders()
    )
    return response.data.data || []
  }
}

export const favoritesService = new FavoritesService()

