import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiTrash2, FiPlus, FiSave } from 'react-icons/fi'

export default function MemoryPage() {
  const [memory, setMemory] = useState(null)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  useEffect(() => {
    fetchMemory()
  }, [])

  const fetchMemory = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/memory')
      if (res.ok) {
        const data = await res.json()
        setMemory(data)
      }
    } catch {
      setMemory({
        name: 'User',
        preferences: { theme: 'dark blue' },
        facts: [],
        history_count: 0
      })
    }
  }

  const addFact = async () => {
    if (!newKey.trim() || !newValue.trim()) return
    try {
      await fetch('http://localhost:3001/api/memory/fact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey, value: newValue })
      })
      setNewKey('')
      setNewValue('')
      fetchMemory()
    } catch {
      // Handle error
    }
  }

  const clearHistory = async () => {
    try {
      await fetch('http://localhost:3001/api/memory/history', { method: 'DELETE' })
      fetchMemory()
    } catch {
      // Handle error
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto p-6"
    >
      <h2 className="text-2xl font-bold text-jarvis-cyan glow-text font-mono tracking-wider mb-6">
        MEMORY BANKS
      </h2>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Profile */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-mono text-jarvis-muted mb-4 tracking-wider">USER PROFILE</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-jarvis-bg/30 p-3 rounded-lg border border-jarvis-border/10">
              <span className="text-xs font-mono text-jarvis-muted">NAME</span>
              <span className="text-sm font-mono text-jarvis-text">{memory?.name || '—'}</span>
            </div>
            <div className="flex justify-between items-center bg-jarvis-bg/30 p-3 rounded-lg border border-jarvis-border/10">
              <span className="text-xs font-mono text-jarvis-muted">THEME</span>
              <span className="text-sm font-mono text-jarvis-cyan">{memory?.preferences?.theme || '—'}</span>
            </div>
            <div className="flex justify-between items-center bg-jarvis-bg/30 p-3 rounded-lg border border-jarvis-border/10">
              <span className="text-xs font-mono text-jarvis-muted">CONVERSATIONS</span>
              <span className="text-sm font-mono text-jarvis-accent">{memory?.history_count || 0}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-mono text-jarvis-muted mb-4 tracking-wider">MEMORY STATS</h3>
          <div className="flex flex-col items-center justify-center h-40">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1a3a5c" strokeWidth="6" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#22d3ee" strokeWidth="6"
                  strokeDasharray="251" strokeDashoffset={251 - (251 * (memory?.facts?.length || 0)) / 50}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-mono text-jarvis-cyan font-bold">
                  {memory?.facts?.length || 0}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono text-jarvis-muted mt-2">STORED FACTS</span>
          </div>
        </div>
      </div>

      {/* Add new fact */}
      <div className="glass-panel p-6 mb-6">
        <h3 className="text-sm font-mono text-jarvis-muted mb-4 tracking-wider">ADD MEMORY</h3>
        <div className="flex gap-3">
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Key (e.g., favorite_color)"
            className="flex-1 bg-jarvis-bg/50 border border-jarvis-border/30 rounded-lg px-3 py-2 text-sm text-jarvis-text font-mono placeholder-jarvis-muted/50 focus:outline-none focus:border-jarvis-cyan/50"
          />
          <input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value (e.g., blue)"
            className="flex-1 bg-jarvis-bg/50 border border-jarvis-border/30 rounded-lg px-3 py-2 text-sm text-jarvis-text font-mono placeholder-jarvis-muted/50 focus:outline-none focus:border-jarvis-cyan/50"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addFact}
            className="px-4 py-2 bg-jarvis-cyan/10 text-jarvis-cyan border border-jarvis-cyan/30 rounded-lg text-sm font-mono hover:bg-jarvis-cyan/20 flex items-center gap-2"
          >
            <FiPlus size={14} /> ADD
          </motion.button>
        </div>
      </div>

      {/* Stored facts */}
      <div className="glass-panel p-6 mb-6">
        <h3 className="text-sm font-mono text-jarvis-muted mb-4 tracking-wider">STORED FACTS</h3>
        <div className="space-y-2">
          {(memory?.facts || []).length === 0 ? (
            <div className="text-center text-jarvis-muted text-sm font-mono py-8">
              No memories stored yet. Add facts above to help me remember.
            </div>
          ) : (
            memory.facts.map((fact, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between bg-jarvis-bg/30 p-3 rounded-lg border border-jarvis-border/10"
              >
                <div>
                  <span className="text-xs font-mono text-jarvis-cyan">{fact.key}</span>
                  <span className="text-xs text-jarvis-muted mx-2">=</span>
                  <span className="text-sm font-mono text-jarvis-text">{fact.value}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={clearHistory}
          className="px-4 py-2 bg-jarvis-danger/10 text-jarvis-danger border border-jarvis-danger/30 rounded-lg text-sm font-mono hover:bg-jarvis-danger/20 flex items-center gap-2"
        >
          <FiTrash2 size={14} /> CLEAR HISTORY
        </motion.button>
      </div>
    </motion.div>
  )
}
