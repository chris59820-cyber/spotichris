import axios from 'axios'
import { API_URL } from '../config/api'

interface LoginResponse {
  token: string
  refreshToken?: string
  user: {
    id: number
    email: string
    username?: string
  }
}

class AuthService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password })
      return response.data
    } catch (error: any) {
      // Re-throw avec plus d'informations
      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        throw error
      } else if (error.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        throw new Error('Le serveur ne répond pas. Vérifiez que le backend est démarré sur le port 3000.')
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        throw new Error('Erreur de configuration de la requête: ' + error.message)
      }
    }
  }

  async register(email: string, password: string, username?: string): Promise<LoginResponse> {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      username,
    })
    return response.data
  }

  async getCurrentUser() {
    const response = await axios.get(`${API_URL}/users/me`, this.getAuthHeaders())
    return response.data
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
    return response.data
  }
}

export const authService = new AuthService()

