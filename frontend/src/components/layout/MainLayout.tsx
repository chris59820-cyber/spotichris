import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import PlayerBar from './PlayerBar'
import { theme } from '../../styles/theme'
import { usePlayer } from '../../contexts/PlayerContext'

const MainLayout: React.FC = () => {
  const { currentlyPlaying } = usePlayer()
  const layoutStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: theme.colors.bgPrimary,
    color: theme.colors.textPrimary,
  }

  const contentWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  }

  const getVideoPlayerWidth = () => {
    // This will be calculated based on the actual video size
    // For now, we use a safe estimate
    return '640px' // Max size
  }

  const mainContentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing.xl,
    marginLeft: '240px', // Sidebar width
    paddingBottom: currentlyPlaying 
      ? (currentlyPlaying.type === 'video' ? '320px' : '110px') // 90px player bar + 20px margin
      : '100px', // Extra space for player (more for video)
    paddingRight: currentlyPlaying?.type === 'video' ? '20px' : theme.spacing.xl, // Space for video player
  }

  return (
    <div style={layoutStyle}>
      <Header />
      <div style={contentWrapperStyle}>
        <Sidebar />
        <main style={mainContentStyle}>
          <Outlet />
        </main>
      </div>
      <PlayerBar />
    </div>
  )
}

export default MainLayout

