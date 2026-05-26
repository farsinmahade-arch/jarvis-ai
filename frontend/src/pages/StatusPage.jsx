import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import RadarDisplay from '../components/RadarDisplay'
import WaveformVisualizer from '../components/WaveformVisualizer'

const modules = [
  { name: 'AI Brain', key: 'ai', description: 'OpenAI GPT Integration' },
  { name: 'Voice Input', key: 'voice_in', description: 'Speech Recognition' },
  { name: 'Voice Output', key: 'voice_out', description: 'Text-to-Speech' },
  { name: 'Wake Word', key: 'wake', description: 'Porcupine Engine' },
  { name: 'Memory', key: 'memory', description: 'Local Database' },
  { name: 'Search', key: 'search', description: 'SearchAPI Integration' },
  { name: 'Automation', key: 'auto', description: 'Desktop Commands' },
]

export default function StatusPage({ backendStatus }) {
  const [systemInfo, setSystemInfo] = useState(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/status')
        if (res.ok) {
          const data = await res.json()
          setSystemInfo(data)
        }
      } catch {
        // Backend offline
      }
    }
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto p-6"
    >
      <h2 className="text-2xl font-bold text-jarvis-cyan glow-text font-mono tracking-wider mb-6">
        SYSTEM STATUS
      </h2>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Radar */}
        <div className="glass-panel p-6 flex flex-col items-center">
          <RadarDisplay size={160} active={backendStatus === 'online'} />
          <div className="mt-4 text-sm font-mono text-jarvis-muted">SYSTEM RADAR</div>
        </div>

        {/* Core stats */}
        <div className="glass-panel p-6 col-span-2">
          <h3 className="text-sm font-mono text-jarvis-muted mb-4 tracking-wider">CORE METRICS</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'CPU', value: systemInfo?.cpu || '—', unit: '%' },
              { label: 'MEMORY', value: systemInfo?.memory || '—', unit: '%' },
              { label: 'UPTIME', value: systemInfo?.uptime || '—', unit: '' },
              { label: 'PLATFORM', value: systemInfo?.platform || '—', unit: '' },
            ].map((stat) => (
              <div key={stat.label} className="bg-jarvis-bg/50 rounded-lg p-3 border border-jarvis-border/20">
                <div className="text-[10px] text-jarvis-muted font-mono">{stat.label}</div>
                <div className="text-xl font-mono text-jarvis-cyan font-bold mt-1">
                  {stat.value}<span className="text-xs text-jarvis-muted">{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Waveform */}
      <div className="glass-panel p-4 mb-8">
        <div className="text-[10px] text-jarvis-muted font-mono mb-2 tracking-wider">SYSTEM WAVEFORM</div>
        <WaveformVisualizer isActive={backendStatus === 'online'} size="md" />
      </div>

      {/* Module status */}
      <div className="glass-panel p-6">
        <h3 className="text-sm font-mono text-jarvis-muted mb-4 tracking-wider">MODULE STATUS</h3>
        <div className="space-y-3">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between bg-jarvis-bg/30 rounded-lg p-3 border border-jarvis-border/10"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  backendStatus === 'online' ? 'bg-jarvis-success' : 'bg-jarvis-muted'
                }`} />
                <div>
                  <div className="text-sm font-mono text-jarvis-text">{mod.name}</div>
                  <div className="text-[10px] text-jarvis-muted">{mod.description}</div>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                backendStatus === 'online'
                  ? 'bg-jarvis-success/10 text-jarvis-success'
                  : 'bg-jarvis-muted/10 text-jarvis-muted'
              }`}>
                {backendStatus === 'online' ? 'ACTIVE' : 'STANDBY'}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
