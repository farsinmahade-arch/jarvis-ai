import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ArcReactor from '../components/ArcReactor'

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('loading') // loading | setup | login
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  async function checkStatus() {
    try {
      const res = await fetch('/api/auth/status')
      const data = await res.json()
      if (data.authenticated) {
        onLogin('')
        return
      }
      setMode(data.password_configured ? 'login' : 'setup')
    } catch {
      setMode('setup')
    }
  }

  async function handleSetup(e) {
    e.preventDefault()
    setError('')
    if (password.length < 4) { setError('Password must be at least 4 characters.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Security initialized. Welcome aboard.')
        setTimeout(() => onLogin(data.greeting || ''), 1200)
      } else {
        setError(data.error)
      }
    } catch { setError('Connection failed.') }
    setSubmitting(false)
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    if (!password) { setError('Password required.'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Identity verified. Access granted.')
        setTimeout(() => onLogin(data.greeting || ''), 800)
      } else {
        setError(data.error)
        setPassword('')
      }
    } catch { setError('Connection failed.') }
    setSubmitting(false)
  }

  if (mode === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center relative z-10">
        <ArcReactor size={120} />
      </div>
    )
  }

  return (
    <div className="h-screen flex items-center justify-center relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8"
      >
        <div className="flex justify-center mb-6">
          <ArcReactor size={140} />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl font-orbitron font-bold text-center text-jarvis-cyan mb-1 tracking-[0.3em]"
        >
          JARVIS
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-jarvis-cyan/50 text-sm tracking-[0.2em] mb-8 font-rajdhani"
        >
          JUST A RATHER VERY INTELLIGENT SYSTEM
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-jarvis-panel/80 backdrop-blur-md border border-jarvis-border rounded-xl p-6"
          style={{ animation: 'glow-border 3s ease-in-out infinite' }}
        >
          <div className="flex items-center gap-2 text-jarvis-cyan text-xs tracking-widest mb-5 font-orbitron">
            <span className="text-base">🔒</span>
            {mode === 'setup' ? 'FIRST-TIME SECURITY SETUP' : 'IDENTITY VERIFICATION REQUIRED'}
          </div>

          <form onSubmit={mode === 'setup' ? handleSetup : handleLogin}>
            <div className="mb-4">
              <label className="block text-jarvis-cyan/60 text-xs tracking-widest mb-2 font-orbitron">
                {mode === 'setup' ? 'CREATE PASSWORD' : 'PASSWORD'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'setup' ? 'Enter password (min 4 chars)' : 'Enter your password'}
                className="w-full bg-jarvis-darker border border-jarvis-border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-jarvis-cyan/50 transition-colors font-rajdhani"
                autoFocus
              />
            </div>

            {mode === 'setup' && (
              <div className="mb-4">
                <label className="block text-jarvis-cyan/60 text-xs tracking-widest mb-2 font-orbitron">
                  CONFIRM PASSWORD
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full bg-jarvis-darker border border-jarvis-border rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-jarvis-cyan/50 transition-colors font-rajdhani"
                />
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-jarvis-red text-sm mb-3 font-rajdhani"
                >
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-jarvis-green text-sm mb-3 font-rajdhani"
                >
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-jarvis-cyan/10 border border-jarvis-cyan/40 rounded-lg text-jarvis-cyan font-orbitron text-sm tracking-widest hover:bg-jarvis-cyan/20 hover:border-jarvis-cyan/60 transition-all disabled:opacity-50 relative overflow-hidden"
            >
              {submitting ? 'PROCESSING...' : mode === 'setup' ? 'INITIALIZE SECURITY' : 'AUTHENTICATE'}
            </button>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-2 mt-6 text-jarvis-cyan/40 text-xs font-orbitron tracking-widest"
        >
          <span className="w-2 h-2 rounded-full bg-jarvis-cyan/60 animate-pulse" />
          SYSTEM {mode === 'setup' ? 'AWAITING CONFIGURATION' : 'STANDBY'}
        </motion.div>
      </motion.div>
    </div>
  )
}
