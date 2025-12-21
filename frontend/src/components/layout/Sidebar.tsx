import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { theme } from '../../styles/theme'

interface NavItem {
  label: string
  path: string
  icon?: string
}

const navItems: NavItem[] = [
  { label: 'Accueil', path: '/', icon: '🏠' },
  { label: 'Rechercher', path: '/search', icon: '🔍' },
  { label: 'Ma bibliothèque', path: '/library', icon: '📚' },
  { label: 'Favoris', path: '/favorites', icon: '⭐' },
  { label: 'Profil', path: '/profile', icon: '👤' },
  { label: 'Administration', path: '/admin', icon: '🔧' },
  { label: 'Test WebSocket', path: '/websocket-test', icon: '🔌' },
]

const Sidebar: React.FC = () => {
  const location = useLocation()

  const sidebarStyle: React.CSSProperties = {
    width: '240px',
    height: '100%',
    backgroundColor: theme.colors.bgSecondary,
    borderRight: `1px solid ${theme.colors.borderPrimary}`,
    padding: theme.spacing.lg,
    position: 'fixed',
    left: 0,
    top: '64px', // Header height
    bottom: '80px', // PlayerBar height
    overflowY: 'auto',
  }

  const navItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'block',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    color: isActive ? theme.colors.primary : theme.colors.textSecondary,
    textDecoration: 'none',
    fontSize: theme.fontSizes.base,
    fontWeight: isActive ? 600 : 400,
    backgroundColor: isActive ? theme.colors.bgTertiary : 'transparent',
    transition: theme.transitions.base,
  })

  return (
    <nav style={sidebarStyle}>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path
        return (
          <Link
            key={item.path}
            to={item.path}
            style={navItemStyle(isActive)}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = theme.colors.bgHover
                e.currentTarget.style.color = theme.colors.textPrimary
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = theme.colors.textSecondary
              }
            }}
          >
            {item.icon && (
              <span
                style={{
                  marginRight: theme.spacing.sm,
                  fontSize: theme.fontSizes.lg,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                }}
              >
                {item.icon}
              </span>
            )}
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default Sidebar

