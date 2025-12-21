import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { Button, Input } from '../../../components/ui'
import { theme } from '../../../styles/theme'

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      console.error('Login error:', err)
      
      // Gestion des erreurs plus détaillée
      if (err.response) {
        // Erreur de l'API
        setError(err.response.data?.message || 'Erreur lors de la connexion')
      } else if (err.request) {
        // Pas de réponse du serveur
        setError('Impossible de se connecter au serveur. Vérifiez que le backend est démarré.')
      } else {
        // Autre erreur
        setError(err.message || 'Erreur lors de la connexion')
      }
    } finally {
      setLoading(false)
    }
  }

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bgPrimary,
    padding: theme.spacing.xl,
  }

  const formStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: theme.colors.bgSecondary,
    padding: theme.spacing['2xl'],
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.borderPrimary}`,
  }

  const titleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes['3xl'],
    fontWeight: 700,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
    background: theme.colors.gradientPrimary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }

  return (
    <div style={containerStyle}>
      <form style={formStyle} onSubmit={handleSubmit}>
        <h1 style={titleStyle}>Connexion</h1>
        
        {error && (
          <div
            style={{
              padding: theme.spacing.md,
              marginBottom: theme.spacing.md,
              backgroundColor: theme.colors.error + '20',
              border: `1px solid ${theme.colors.error}`,
              borderRadius: theme.borderRadius.md,
              color: theme.colors.error,
            }}
          >
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: theme.spacing.lg }}
        />

        <Input
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          showPasswordToggle
          style={{ marginBottom: theme.spacing.lg }}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={loading}
          style={{ marginBottom: theme.spacing.md }}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>

        <div style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
          Pas encore de compte ?{' '}
          <Link
            to="/register"
            style={{
              color: theme.colors.primary,
              textDecoration: 'none',
            }}
          >
            S'inscrire
          </Link>
        </div>
      </form>
    </div>
  )
}

export default LoginForm

