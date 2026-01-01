import React, { useEffect } from 'react'
import { theme } from '../../styles/theme'
import Button from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeMap = {
    sm: '400px',
    md: '600px',
    lg: '800px',
    xl: '1000px',
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: theme.zIndex.modal,
    padding: theme.spacing.lg,
  }

  const modalStyle: React.CSSProperties = {
    backgroundColor: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.borderPrimary}`,
    boxShadow: theme.shadows.lg,
    width: '100%',
    maxWidth: sizeMap[size],
    maxHeight: '90vh',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottom: `1px solid ${theme.colors.borderPrimary}`,
  }

  const titleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes.xl,
    fontWeight: 600,
    color: theme.colors.textPrimary,
  }

  const contentStyle: React.CSSProperties = {
    padding: theme.spacing.lg,
    flex: 1,
    overflow: 'auto',
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div style={headerStyle}>
            <h2 style={titleStyle}>{title}</h2>
            <Button variant="secondary" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        )}
        <div style={contentStyle}>{children}</div>
      </div>
    </div>
  )
}

export default Modal






