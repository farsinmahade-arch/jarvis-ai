import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import BootScreen from './components/BootScreen'
import ChatPage from './pages/ChatPage'
import StatusPage from './pages/StatusPage'
import MemoryPage from './pages/MemoryPage'
import CommandsPage from './pages/CommandsPage'
import SettingsPage from './pages/SettingsPage'
import ParticleField from './animations/ParticleField'

export default function App() {
  const [booted, setBooted] = useState(false)
  const [activePage, setActivePage] = useState('chat')
  const [backendStatus, setBackendStatus] = useState('connecting')

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/health')
        if (res.ok) {
          setBackendStatus('online')
        }
      } catch {
        setBackendStatus('offline')
      }
    }

    const interval = setInterval(checkBackend, 3000)
    checkBackend()
    return () => clearInterval(interval)
  }, [])

  const renderPage = () => {
    switch (activePage) {
      case 'chat': return <ChatPage backendStatus={backendStatus} />
      case 'status': return <StatusPage backendStatus={backendStatus} />
      case 'memory': return <MemoryPage />
      case 'commands': return <CommandsPage />
      case 'settings': return <SettingsPage />
      default: return <ChatPage backendStatus={backendStatus} />
    }
  }

  return (
    <div className="h-screen w-screen bg-jarvis-bg overflow-hidden relative scanline">
      <ParticleField />

      <AnimatePresence mode="wait">
        {!booted ? (
          <BootScreen key="boot" onComplete={() => setBooted(true)} />
        ) : (
          <div key="main" className="h-full flex flex-col relative z-10">
            <TitleBar backendStatus={backendStatus} />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar activePage={activePage} setActivePage={setActivePage} />
              <main className="flex-1 overflow-hidden">
                {renderPage()}
              </main>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
