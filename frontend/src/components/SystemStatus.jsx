import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function SystemStatus() {
  const [status, setStatus] = useState(null)
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  async function fetchAll() {
    await Promise.all([fetchStatus(), fetchSettings()])
  }

  async function fetchStatus() {
    try {
      const res = await fetch('/api/system')
      const data = await res.json()
      setStatus(data)
    } catch { /* ignore */ }
  }

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setSettings(data)
    } catch { /* ignore */ }
  }

  function GaugeBar({ label, value, max = 100, color = 'jarvis-cyan' }) {
    const pct = Math.min((value / max) * 100, 100)
    const barColor =
      pct > 80 ? 'bg-jarvis-red' : pct > 60 ? 'bg-jarvis-gold' : `bg-${color}`

    return (
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-orbitron tracking-wider text-jarvis-cyan/60">{label}</span>
          <span className="font-rajdhani text-white">{value}%</span>
        </div>
        <div className="h-1.5 bg-jarvis-panel rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ boxShadow: `0 0 8px rgba(34,211,238,0.3)` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 p-4 h-full flex flex-col overflow-y-auto">
      <h2 className="text-sm font-orbitron tracking-widest text-jarvis-cyan mb-4">
        SYSTEM STATUS
      </h2>

      {status && (
        <div className="space-y-1 mb-6">
          <GaugeBar label="CPU" value={status.cpu_percent} />
          <GaugeBar label="RAM" value={status.ram_percent} />
          {status.ram_used_gb != null && (
            <div className="text-[10px] text-gray-500 font-rajdhani mb-3">
              {status.ram_used_gb} GB / {status.ram_total_gb} GB used
            </div>
          )}
          {status.battery_percent != null && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-orbitron tracking-wider text-jarvis-cyan/60">BATTERY</span>
              <span className="font-rajdhani text-white">{status.battery_percent}%</span>
              {status.battery_charging && (
                <span className="text-jarvis-green text-[10px] font-orbitron">CHARGING</span>
              )}
            </div>
          )}
        </div>
      )}

      {!status && (
        <div className="text-xs text-gray-500 font-rajdhani mb-6 animate-pulse">
          Loading system metrics...
        </div>
      )}

      {/* Modules */}
      <h3 className="text-xs font-orbitron tracking-widest text-jarvis-cyan/60 mb-3">MODULES</h3>
      <div className="space-y-2 mb-6">
        {[
          { name: 'AI Brain', status: 'online' },
          { name: 'Chat Engine', status: 'online' },
          { name: 'Command Processor', status: 'online' },
          { name: 'Search API', status: 'standby' },
          { name: 'Voice Input', status: 'standby' },
          { name: 'Voice Output', status: 'standby' },
        ].map((mod) => (
          <div key={mod.name} className="flex items-center gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                mod.status === 'online'
                  ? 'bg-jarvis-green'
                  : mod.status === 'standby'
                    ? 'bg-jarvis-gold'
                    : 'bg-jarvis-red'
              }`}
            />
            <span className="text-xs font-rajdhani text-gray-400 flex-1">{mod.name}</span>
            <span
              className={`text-[10px] font-orbitron tracking-wider ${
                mod.status === 'online'
                  ? 'text-jarvis-green'
                  : mod.status === 'standby'
                    ? 'text-jarvis-gold'
                    : 'text-jarvis-red'
              }`}
            >
              {mod.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Settings */}
      {settings && (
        <>
          <h3 className="text-xs font-orbitron tracking-widest text-jarvis-cyan/60 mb-3">
            CONFIGURATION
          </h3>
          <div className="space-y-2">
            {[
              ['Assistant', settings.assistant_name],
              ['Owner', settings.owner_name],
              ['Wake Word', settings.wake_word],
              ['AI Model', settings.ai_model],
              ['Provider', settings.ai_provider],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-gray-500 font-rajdhani">{label}</span>
                <span className="text-white font-rajdhani">{value || '—'}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
