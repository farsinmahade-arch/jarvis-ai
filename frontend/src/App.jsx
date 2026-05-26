import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ParticleBackground from './components/ParticleBackground'

export default function App() {
  const [authenticated, setAuthenticated] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/auth/status')
      const data = await res.json()
      setAuthenticated(data.authenticated)
    } catch {
      /* server not ready */
    }
    setLoading(false)
  }

  function handleLogin(greetingMsg) {
    setGreeting(greetingMsg)
    setAuthenticated(true)
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setAuthenticated(false)
    setGreeting('')
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-jarvis-dark">
        <div className="text-jarvis-cyan text-2xl font-orbitron animate-pulse">
          INITIALIZING JARVIS...
        </div>
      </div>
    )
  }

  return (
    <>
      <ParticleBackground />
      {authenticated ? (
        <Dashboard greeting={greeting} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </>
  )
}
