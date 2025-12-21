import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { Button, Input } from '../../../components/ui'
import { theme } from '../../../styles/theme'

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      await register(email, password, username || undefined)
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription')
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
        <h1 style={titleStyle}>Inscription</h1>
        
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
          label="Nom d'utilisateur (optionnel)"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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

        <Input
          label="Confirmer le mot de passe"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? 'Inscription...' : 'S\'inscrire'}
        </Button>

        <div style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
          Déjà un compte ?{' '}
          <Link
            to="/login"
            style={{
              color: theme.colors.primary,
              textDecoration: 'none',
            }}
          >
            Se connecter
          </Link>
        </div>
      </form>
    </div>
  )
}

export default RegisterForm

