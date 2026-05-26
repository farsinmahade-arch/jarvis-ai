import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ArcReactor from '../components/ArcReactor'
import ShortcutsPanel from '../components/ShortcutsPanel'
import SystemStatus from '../components/SystemStatus'
import WaveformVisualizer from '../components/WaveformVisualizer'

export default function Dashboard({ greeting, onLogout }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showSystem, setShowSystem] = useState(false)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (greeting) {
      setMessages([{ role: 'jarvis', text: greeting, type: 'greeting' }])
    } else {
      fetchGreeting()
    }
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchGreeting() {
    try {
      const res = await fetch('/api/greeting')
      const data = await res.json()
      if (data.greeting) {
        setMessages([{ role: 'jarvis', text: data.greeting, type: 'greeting' }])
      }
    } catch { /* ignore */ }
  }

  async function sendMessage(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || thinking) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text }])
    setThinking(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()

      if (res.status === 401) {
        onLogout()
        return
      }

      // Auto-open URLs from shortcut commands
      if (data.action === 'open_url' && data.url) {
        window.open(data.url, '_blank')
      }

      setMessages((prev) => [
        ...prev,
        { role: 'jarvis', text: data.response || data.error, type: data.type },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'jarvis', text: 'Connection lost. Please try again.', type: 'error' },
      ])
    }
    setThinking(false)
    inputRef.current?.focus()
  }

  async function clearMemory() {
    await fetch('/api/clear-memory', { method: 'POST' })
    setMessages((prev) => [
      ...prev,
      { role: 'jarvis', text: 'Memory cleared. Conversation history reset.', type: 'system' },
    ])
  }

  return (
    <div className="h-screen flex flex-col relative z-10">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-3 bg-jarvis-darker/80 backdrop-blur border-b border-jarvis-border/50">
        <div className="flex items-center gap-3">
          <ArcReactor size={36} />
          <div>
            <h1 className="text-lg font-orbitron font-bold text-jarvis-cyan tracking-widest">JARVIS</h1>
            <p className="text-[10px] text-jarvis-cyan/40 tracking-widest font-orbitron">AI ASSISTANT v2.0</p>
          </div>
        </div>

        <WaveformVisualizer active={thinking} />

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowSystem(false); setShowShortcuts(!showShortcuts) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-orbitron tracking-wider transition-all border ${
              showShortcuts
                ? 'bg-jarvis-cyan/20 border-jarvis-cyan/50 text-jarvis-cyan'
                : 'border-jarvis-border text-jarvis-cyan/60 hover:border-jarvis-cyan/30'
            }`}
          >
            SHORTCUTS
          </button>
          <button
            onClick={() => { setShowShortcuts(false); setShowSystem(!showSystem) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-orbitron tracking-wider transition-all border ${
              showSystem
                ? 'bg-jarvis-cyan/20 border-jarvis-cyan/50 text-jarvis-cyan'
                : 'border-jarvis-border text-jarvis-cyan/60 hover:border-jarvis-cyan/30'
            }`}
          >
            SYSTEM
          </button>
          <button
            onClick={clearMemory}
            className="px-3 py-1.5 rounded-lg text-xs font-orbitron tracking-wider border border-jarvis-border text-jarvis-cyan/60 hover:border-jarvis-gold/50 hover:text-jarvis-gold transition-all"
          >
            CLEAR
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg text-xs font-orbitron tracking-wider border border-jarvis-border text-jarvis-red/60 hover:border-jarvis-red/50 hover:text-jarvis-red transition-all"
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-jarvis-cyan/10 border border-jarvis-cyan/20 text-white'
                        : msg.type === 'error'
                          ? 'bg-jarvis-red/10 border border-jarvis-red/20 text-jarvis-red'
                          : msg.type === 'greeting'
                            ? 'bg-jarvis-gold/10 border border-jarvis-gold/20 text-jarvis-gold'
                            : 'bg-jarvis-panel border border-jarvis-border text-gray-200'
                    }`}
                  >
                    {msg.role === 'jarvis' && (
                      <div className="text-[10px] font-orbitron tracking-widest text-jarvis-cyan/50 mb-1">
                        JARVIS
                      </div>
                    )}
                    <div className="font-rajdhani text-[15px] leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {thinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-jarvis-panel border border-jarvis-border rounded-xl px-4 py-3">
                  <div className="text-[10px] font-orbitron tracking-widest text-jarvis-cyan/50 mb-1">
                    JARVIS
                  </div>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-jarvis-cyan"
                        style={{ animation: `typing-dot 1.4s ${i * 0.2}s infinite` }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="px-6 py-4 bg-jarvis-darker/60 backdrop-blur border-t border-jarvis-border/30">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Talk to JARVIS..."
                  className="w-full bg-jarvis-panel border border-jarvis-border rounded-xl px-5 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-jarvis-cyan/40 transition-colors font-rajdhani text-[15px]"
                  disabled={thinking}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-orbitron text-jarvis-cyan/20 tracking-widest">
                  ENTER ↵
                </div>
              </div>
              <button
                type="submit"
                disabled={thinking || !input.trim()}
                className="px-6 py-3 bg-jarvis-cyan/10 border border-jarvis-cyan/30 rounded-xl text-jarvis-cyan font-orbitron text-xs tracking-widest hover:bg-jarvis-cyan/20 transition-all disabled:opacity-30"
              >
                SEND
              </button>
            </div>
          </form>
        </div>

        {/* Side Panels */}
        <AnimatePresence>
          {showShortcuts && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-jarvis-border/50 bg-jarvis-darker/80 backdrop-blur overflow-hidden"
            >
              <ShortcutsPanel />
            </motion.div>
          )}
          {showSystem && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-jarvis-border/50 bg-jarvis-darker/80 backdrop-blur overflow-hidden"
            >
              <SystemStatus />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
