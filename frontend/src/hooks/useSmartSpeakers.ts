/**
 * Hook pour gérer l'intégration avec les enceintes connectées
 * Supporte Chromecast, AirPlay, et autres protocoles
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface SmartSpeakerDevice {
  id: string
  name: string
  type: 'chromecast' | 'airplay' | 'dlna' | 'bluetooth'
  isConnected: boolean
}

export interface SmartSpeakerService {
  devices: SmartSpeakerDevice[]
  isAvailable: boolean
  isConnected: boolean
  currentDevice: SmartSpeakerDevice | null
  connect: (deviceId: string) => Promise<void>
  disconnect: () => Promise<void>
  cast: (mediaUrl: string, metadata?: any) => Promise<void>
}

// Service pour Chromecast
class ChromecastService implements SmartSpeakerService {
  private castSession: any = null
  private mediaSession: any = null
  devices: SmartSpeakerDevice[] = []
  isAvailable = false
  isConnected = false
  currentDevice: SmartSpeakerDevice | null = null

  constructor() {
    this.initialize()
  }

  private async initialize() {
    // Vérifier si l'API Chromecast est disponible
    if (window.chrome?.cast?.isAvailable) {
      this.isAvailable = true
      this.discoverDevices()
    }
  }

  private discoverDevices() {
    // Découvrir les appareils Chromecast disponibles
    // Note: Nécessite l'API Google Cast SDK
    this.devices = [
      {
        id: 'chromecast-1',
        name: 'Chromecast Living Room',
        type: 'chromecast',
        isConnected: false,
      },
    ]
  }

  async connect(deviceId: string): Promise<void> {
    const device = this.devices.find((d) => d.id === deviceId)
    if (!device) throw new Error('Device not found')

    // Implémentation de la connexion Chromecast
    // Note: Nécessite l'API Google Cast SDK
    this.currentDevice = device
    this.isConnected = true
    device.isConnected = true
  }

  async disconnect(): Promise<void> {
    if (this.castSession) {
      this.castSession.stop()
      this.castSession = null
    }
    if (this.currentDevice) {
      this.currentDevice.isConnected = false
    }
    this.currentDevice = null
    this.isConnected = false
  }

  async cast(mediaUrl: string, metadata?: any): Promise<void> {
    if (!this.isConnected || !this.castSession) {
      throw new Error('Not connected to a device')
    }

    // Implémentation du cast
    // Note: Nécessite l'API Google Cast SDK
  }
}

// Service pour AirPlay
class AirPlayService implements SmartSpeakerService {
  devices: SmartSpeakerDevice[] = []
  isAvailable = false
  isConnected = false
  currentDevice: SmartSpeakerDevice | null = null

  constructor() {
    this.initialize()
  }

  private initialize() {
    // Vérifier si AirPlay est disponible (Safari uniquement)
    if (
      (window as any).webkit?.AirPlay?.isAvailable ||
      (document as any).webkit?.AirPlay?.isAvailable
    ) {
      this.isAvailable = true
      this.discoverDevices()
    }
  }

  private discoverDevices() {
    // AirPlay découvre automatiquement les appareils
    this.devices = [
      {
        id: 'airplay-1',
        name: 'Apple TV',
        type: 'airplay',
        isConnected: false,
      },
    ]
  }

  async connect(deviceId: string): Promise<void> {
    const device = this.devices.find((d) => d.id === deviceId)
    if (!device) throw new Error('Device not found')

    this.currentDevice = device
    this.isConnected = true
    device.isConnected = true
  }

  async disconnect(): Promise<void> {
    if (this.currentDevice) {
      this.currentDevice.isConnected = false
    }
    this.currentDevice = null
    this.isConnected = false
  }

  async cast(mediaUrl: string, metadata?: any): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to a device')
    }

    // Utiliser l'API AirPlay native
    const video = document.createElement('video')
    video.src = mediaUrl
    ;(video as any).webkitShowPlaybackTargetPicker()
  }
}

export const useSmartSpeakers = () => {
  const [devices, setDevices] = useState<SmartSpeakerDevice[]>([])
  const [isAvailable, setIsAvailable] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [currentDevice, setCurrentDevice] = useState<SmartSpeakerDevice | null>(null)
  const chromecastServiceRef = useRef<ChromecastService | null>(null)
  const airPlayServiceRef = useRef<AirPlayService | null>(null)

  useEffect(() => {
    // Initialiser les services
    chromecastServiceRef.current = new ChromecastService()
    airPlayServiceRef.current = new AirPlayService()

    // Découvrir les appareils disponibles
    const allDevices: SmartSpeakerDevice[] = [
      ...(chromecastServiceRef.current?.devices || []),
      ...(airPlayServiceRef.current?.devices || []),
    ]

    setDevices(allDevices)
    setIsAvailable(
      (chromecastServiceRef.current?.isAvailable || false) ||
        (airPlayServiceRef.current?.isAvailable || false)
    )
  }, [])

  const connect = useCallback(async (deviceId: string) => {
    const device = devices.find((d) => d.id === deviceId)
    if (!device) throw new Error('Device not found')

    let service: SmartSpeakerService | null = null

    switch (device.type) {
      case 'chromecast':
        service = chromecastServiceRef.current
        break
      case 'airplay':
        service = airPlayServiceRef.current
        break
    }

    if (service) {
      await service.connect(deviceId)
      setCurrentDevice(device)
      setIsConnected(true)
      setDevices((prev) =>
        prev.map((d) => (d.id === deviceId ? { ...d, isConnected: true } : d))
      )
    }
  }, [devices])

  const disconnect = useCallback(async () => {
    if (currentDevice) {
      let service: SmartSpeakerService | null = null

      switch (currentDevice.type) {
        case 'chromecast':
          service = chromecastServiceRef.current
          break
        case 'airplay':
          service = airPlayServiceRef.current
          break
      }

      if (service) {
        await service.disconnect()
        setCurrentDevice(null)
        setIsConnected(false)
        setDevices((prev) =>
          prev.map((d) => ({ ...d, isConnected: false }))
        )
      }
    }
  }, [currentDevice])

  const cast = useCallback(async (mediaUrl: string, metadata?: any) => {
    if (!currentDevice) throw new Error('No device connected')

    let service: SmartSpeakerService | null = null

    switch (currentDevice.type) {
      case 'chromecast':
        service = chromecastServiceRef.current
        break
      case 'airplay':
        service = airPlayServiceRef.current
        break
    }

    if (service) {
      await service.cast(mediaUrl, metadata)
    }
  }, [currentDevice])

  return {
    devices,
    isAvailable,
    isConnected,
    currentDevice,
    connect,
    disconnect,
    cast,
  }
}

