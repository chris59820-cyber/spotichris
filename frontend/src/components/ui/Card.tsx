import React from 'react'
import { theme } from '../../styles/theme'

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  onMouseEnter?: (e: React.MouseEvent<HTMLDivElement>) => void
  onMouseLeave?: (e: React.MouseEvent<HTMLDivElement>) => void
  hoverable?: boolean
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
  hoverable = false,
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    border: `1px solid ${theme.colors.borderPrimary}`,
    transition: theme.transitions.base,
    cursor: onClick || hoverable ? 'pointer' : 'default',
    ...style,
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onMouseEnter) {
      onMouseEnter(e)
    } else if (hoverable || onClick) {
      e.currentTarget.style.borderColor = theme.colors.primary
      e.currentTarget.style.boxShadow = theme.shadows.glow
      e.currentTarget.style.transform = 'translateY(-4px)'
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onMouseLeave) {
      onMouseLeave(e)
    } else if (hoverable || onClick) {
      e.currentTarget.style.borderColor = theme.colors.borderPrimary
      e.currentTarget.style.boxShadow = 'none'
      e.currentTarget.style.transform = 'translateY(0)'
    }
  }

  return (
    <div
      style={cardStyle}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

export default Card

