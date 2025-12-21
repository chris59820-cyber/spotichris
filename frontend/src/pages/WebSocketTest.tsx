import React, { useState, useEffect } from 'react'
import { carPlayService, PlaybackState, CarPlayCommand } from '../services/carplay.service'
import { theme } from '../styles/theme'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

const WebSocketTest: React.FC = () => {
  const [connected, setConnected] = useState(false)
  const [lastState, setLastState] = useState<PlaybackState | null>(null)
  const [lastCommand, setLastCommand] = useState<CarPlayCommand | null>(null)
  const [messages, setMessages] = useState<string[]>([])
  const [testResults, setTestResults] = useState<{ [key: string]: boolean }>({})

  const addMessage = (message: string, isError = false) => {
    const timestamp = new Date().toLocaleTimeString()
    setMessages((prev) => [...prev, `[${timestamp}] ${isError ? '❌' : '✅'} ${message}`])
  }

  useEffect(() => {
    // Se connecter au WebSocket
    carPlayService.connect(
      // Callback pour recevoir les mises à jour d'état
      (state: PlaybackState) => {
        setLastState(state)
        addMessage(`État reçu: ${state.mediaTitle || 'Aucun média'}`)
        setTestResults((prev) => ({ ...prev, playback_state: true }))
      },
      // Callback pour recevoir les commandes
      (command: CarPlayCommand) => {
        setLastCommand(command)
        addMessage(`Commande reçue: ${command.command}`)
        setTestResults((prev) => ({ ...prev, carplay_command: true }))
      }
    )

    // Vérifier l'état de connexion périodiquement
    const checkInterval = setInterval(() => {
      const isConnected = carPlayService.isConnected()
      setConnected(isConnected)
      if (isConnected && !testResults.connection) {
        setTestResults((prev) => ({ ...prev, connection: true }))
        addMessage('Connexion établie')
      }
    }, 1000)

    return () => {
      clearInterval(checkInterval)
      carPlayService.disconnect()
    }
  }, [])

  const handleSendState = () => {
    if (!carPlayService.isConnected()) {
      addMessage('Non connecté au WebSocket', true)
      return
    }

    const testState: PlaybackState = {
      isPlaying: true,
      currentTime: 45,
      duration: 180,
      media: {
        id: 999,
        title: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        type: 'music',
        duration: 180,
      },
      mediaId: 999,
      mediaTitle: 'Test Song',
      mediaArtist: 'Test Artist',
      mediaAlbum: 'Test Album',
      mediaType: 'music',
    }

    carPlayService.sendPlaybackState(testState)
    addMessage('État de lecture envoyé')
  }

  const handleSendCommand = (command: CarPlayCommand['command']) => {
    if (!carPlayService.isConnected()) {
      addMessage('Non connecté au WebSocket', true)
      return
    }

    carPlayService.sendCommand({ command })
    addMessage(`Commande envoyée: ${command}`)
  }

  const handleClearMessages = () => {
    setMessages([])
    setTestResults({})
  }

  const pageStyle: React.CSSProperties = {
    padding: theme.spacing.xl,
    maxWidth: '1200px',
    margin: '0 auto',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes['4xl'],
    fontWeight: 700,
    marginBottom: theme.spacing.xl,
    background: theme.colors.gradientPrimary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }

  const statusStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: connected ? theme.colors.primary + '20' : theme.colors.bgTertiary,
    marginBottom: theme.spacing.lg,
  }

  const sectionStyle: React.CSSProperties = {
    marginBottom: theme.spacing.xl,
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: 600,
    marginBottom: theme.spacing.md,
    color: theme.colors.textPrimary,
  }

  const buttonGroupStyle: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  }

  const messagesStyle: React.CSSProperties = {
    backgroundColor: theme.colors.bgSecondary,
    border: `1px solid ${theme.colors.borderPrimary}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    maxHeight: '400px',
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: theme.fontSizes.sm,
  }

  const messageStyle: React.CSSProperties = {
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    color: theme.colors.textSecondary,
  }

  const resultsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  }

  const resultItemStyle: React.CSSProperties = {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.bgSecondary,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.borderPrimary}`,
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Test WebSocket</h1>

      {/* Statut de connexion */}
      <div style={statusStyle}>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: connected ? theme.colors.primary : theme.colors.textTertiary,
            boxShadow: connected ? theme.shadows.glow : 'none',
          }}
        />
        <span style={{ fontWeight: 600, color: theme.colors.textPrimary }}>
          {connected ? 'Connecté' : 'Déconnecté'}
        </span>
      </div>

      {/* Résultats des tests */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Résultats des tests</h2>
        <div style={resultsStyle}>
          {Object.entries(testResults).map(([test, result]) => (
            <div key={test} style={resultItemStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}>
                <span>{result ? '✅' : '⏳'}</span>
                <span style={{ textTransform: 'capitalize' }}>{test.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Actions</h2>
        <Card>
          <div style={{ padding: theme.spacing.md }}>
            <div style={buttonGroupStyle}>
              <Button onClick={handleSendState} disabled={!connected}>
                Envoyer un état de lecture
              </Button>
              <Button onClick={() => handleSendCommand('play')} disabled={!connected}>
                Commande: Play
              </Button>
              <Button onClick={() => handleSendCommand('pause')} disabled={!connected}>
                Commande: Pause
              </Button>
              <Button onClick={() => handleSendCommand('next')} disabled={!connected}>
                Commande: Next
              </Button>
              <Button onClick={() => handleSendCommand('previous')} disabled={!connected}>
                Commande: Previous
              </Button>
              <Button onClick={() => handleSendCommand('seek')} disabled={!connected}>
                Commande: Seek
              </Button>
              <Button onClick={handleClearMessages} variant="secondary">
                Effacer les messages
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Dernier état reçu */}
      {lastState && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Dernier état reçu</h2>
          <Card>
            <div style={{ padding: theme.spacing.md }}>
              <pre style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm }}>
                {JSON.stringify(lastState, null, 2)}
              </pre>
            </div>
          </Card>
        </div>
      )}

      {/* Dernière commande reçue */}
      {lastCommand && (
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Dernière commande reçue</h2>
          <Card>
            <div style={{ padding: theme.spacing.md }}>
              <pre style={{ color: theme.colors.textSecondary, fontSize: theme.fontSizes.sm }}>
                {JSON.stringify(lastCommand, null, 2)}
              </pre>
            </div>
          </Card>
        </div>
      )}

      {/* Messages */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Messages</h2>
        <div style={messagesStyle}>
          {messages.length === 0 ? (
            <div style={{ color: theme.colors.textTertiary, fontStyle: 'italic' }}>
              Aucun message pour le moment...
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} style={messageStyle}>
                {message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default WebSocketTest

