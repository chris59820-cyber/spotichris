import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import Button from '../ui/Button'
import { theme } from '../../styles/theme'

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const headerStyle: React.CSSProperties = {
    height: '64px',
    backgroundColor: theme.colors.bgSecondary,
    borderBottom: `1px solid ${theme.colors.borderPrimary}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${theme.spacing.xl}`,
    position: 'sticky',
    top: 0,
    zIndex: theme.zIndex.sticky,
  }

  const logoStyle: React.CSSProperties = {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: 700,
    backgroundImage: theme.colors.gradientPrimary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
    textDecoration: 'none',
    display: 'inline-block',
    lineHeight: 1.2,
    userSelect: 'none',
    WebkitUserSelect: 'none',
    msUserSelect: 'none',
  }

  return (
    <header style={headerStyle}>
      <Link to="/" style={logoStyle}>
        SPOTICHRIS
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
        {user ? (
          <>
            <span style={{ color: theme.colors.textSecondary }}>
              {user.username || user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Déconnexion
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
              Connexion
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
              Inscription
            </Button>
          </>
        )}
      </div>
    </header>
  )
}

export default Header

