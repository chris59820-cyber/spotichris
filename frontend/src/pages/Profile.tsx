import React from 'react'
import { theme } from '../styles/theme'
import { useAuth } from '../features/auth/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

const Profile: React.FC = () => {
  const { user } = useAuth()
  const { mode, toggleTheme, theme: currentTheme } = useTheme()

  const pageStyle: React.CSSProperties = {
    padding: theme.spacing.xl,
    maxWidth: '800px',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes['4xl'],
    fontWeight: 700,
    marginBottom: theme.spacing.xl,
    color: currentTheme.colors.textPrimary,
  }

  const sectionStyle: React.CSSProperties = {
    marginBottom: theme.spacing.xl,
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: 600,
    marginBottom: theme.spacing.md,
    color: currentTheme.colors.textPrimary,
  }

  const settingRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: currentTheme.colors.bgTertiary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  }

  const settingLabelStyle: React.CSSProperties = {
    color: currentTheme.colors.textPrimary,
    fontSize: theme.fontSizes.base,
    fontWeight: 500,
  }

  const settingDescriptionStyle: React.CSSProperties = {
    color: currentTheme.colors.textSecondary,
    fontSize: theme.fontSizes.sm,
    marginTop: theme.spacing.xs,
  }

  const toggleContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
  }

  const toggleButtonStyle: React.CSSProperties = {
    position: 'relative',
    width: '60px',
    height: '32px',
    borderRadius: theme.borderRadius.full,
    backgroundColor: mode === 'dark' ? currentTheme.colors.bgTertiary : currentTheme.colors.primary,
    border: `2px solid ${mode === 'dark' ? currentTheme.colors.borderPrimary : currentTheme.colors.primary}`,
    cursor: 'pointer',
    transition: theme.transitions.base,
    outline: 'none',
  }

  const toggleThumbStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2px',
    left: mode === 'dark' ? '2px' : '28px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: currentTheme.colors.textPrimary,
    transition: theme.transitions.base,
    boxShadow: theme.shadows.md,
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Profil</h1>
      
      {user && (
        <Card style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Informations personnelles</h2>
          <p style={{ color: currentTheme.colors.textSecondary, marginBottom: theme.spacing.md }}>
            <strong style={{ color: currentTheme.colors.textPrimary }}>Email:</strong> {user.email}
          </p>
          {user.username && (
            <p style={{ color: currentTheme.colors.textSecondary }}>
              <strong style={{ color: currentTheme.colors.textPrimary }}>Nom d'utilisateur:</strong> {user.username}
            </p>
          )}
        </Card>
      )}

      <Card style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Préférences</h2>
        
        <div style={settingRowStyle}>
          <div>
            <div style={settingLabelStyle}>Mode sombre / clair</div>
            <div style={settingDescriptionStyle}>
              Basculer entre le thème sombre et le thème clair
            </div>
          </div>
          <div style={toggleContainerStyle}>
            <span style={{ color: currentTheme.colors.textSecondary, fontSize: theme.fontSizes.sm }}>
              {mode === 'dark' ? '🌙' : '☀️'}
            </span>
            <button
              style={toggleButtonStyle}
              onClick={toggleTheme}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = theme.shadows.glow
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
              }}
              aria-label={`Basculer vers le mode ${mode === 'dark' ? 'clair' : 'sombre'}`}
            >
              <div style={toggleThumbStyle} />
            </button>
            <span style={{ color: currentTheme.colors.textSecondary, fontSize: theme.fontSizes.sm, minWidth: '60px' }}>
              {mode === 'dark' ? 'Sombre' : 'Clair'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Profile

