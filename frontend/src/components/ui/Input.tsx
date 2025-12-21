import React, { useState } from 'react'
import { theme } from '../../styles/theme'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  showPasswordToggle?: boolean
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  type,
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password')
    : type

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: theme.spacing.md,
    paddingRight: showPasswordToggle && type === 'password' ? '45px' : theme.spacing.md,
    backgroundColor: theme.colors.bgSecondary,
    border: `2px solid ${error ? theme.colors.error : theme.colors.borderPrimary}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.textPrimary,
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fonts.primary,
    outline: 'none',
    transition: theme.transitions.base,
  }

  const toggleButtonStyle: React.CSSProperties = {
    position: 'absolute',
    right: theme.spacing.sm,
    top: label ? '38px' : theme.spacing.sm,
    background: 'transparent',
    border: 'none',
    color: theme.colors.textSecondary,
    cursor: 'pointer',
    padding: theme.spacing.xs,
    fontSize: theme.fontSizes.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: theme.transitions.base,
  }

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: theme.spacing.sm,
            color: theme.colors.textSecondary,
            fontSize: theme.fontSizes.sm,
            fontWeight: 500,
          }}
        >
          {label}
        </label>
      )}
      <div style={containerStyle}>
        <input
          type={inputType}
          style={inputStyle}
          className={className}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.colors.primary
            e.currentTarget.style.boxShadow = theme.shadows.glow
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error 
              ? theme.colors.error 
              : theme.colors.borderPrimary
            e.currentTarget.style.boxShadow = 'none'
          }}
          {...props}
        />
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            style={toggleButtonStyle}
            onClick={() => setShowPassword(!showPassword)}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = theme.colors.primary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = theme.colors.textSecondary
            }}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>
      {error && (
        <span
          style={{
            display: 'block',
            marginTop: theme.spacing.xs,
            color: theme.colors.error,
            fontSize: theme.fontSizes.sm,
          }}
        >
          {error}
        </span>
      )}
    </div>
  )
}

export default Input

