import React from 'react'
import { theme } from '../../styles/theme'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    cursor: 'pointer',
    transition: theme.transitions.base,
    border: 'none',
    outline: 'none',
    fontFamily: theme.fonts.primary,
  }

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.textInverse,
      boxShadow: theme.shadows.glow,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      color: theme.colors.textPrimary,
      boxShadow: theme.shadows.glow,
    },
    outline: {
      backgroundColor: 'transparent',
      color: theme.colors.primary,
      border: `2px solid ${theme.colors.primary}`,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: theme.colors.textPrimary,
    },
  }

  const sizeStyles = {
    sm: {
      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
      fontSize: theme.fontSizes.sm,
      borderRadius: theme.borderRadius.md,
    },
    md: {
      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
      fontSize: theme.fontSizes.base,
      borderRadius: theme.borderRadius.md,
    },
    lg: {
      padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
      fontSize: theme.fontSizes.lg,
      borderRadius: theme.borderRadius.lg,
    },
  }

  const buttonStyle: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    width: fullWidth ? '100%' : 'auto',
  }

  const hoverStyle = variant === 'ghost' 
    ? { backgroundColor: theme.colors.bgHover }
    : { 
        boxShadow: theme.shadows.glowStrong,
        transform: 'translateY(-2px)',
      }

  return (
    <button
      style={buttonStyle}
      className={className}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, hoverStyle)
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow || 'none'
        e.currentTarget.style.transform = 'translateY(0)'
        if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'transparent'
        }
      }}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button






