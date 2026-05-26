import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const ICONS = {
  yt: '▶', g: '🔍', gh: '🐙', gm: '📧', gd: '📁', gp: '📷',
  maps: '🗺', news: '📰', rd: '🔶', tw: '🐦', ig: '📸', fb: '👤',
  li: '💼', so: '📚', wp: '📖', amz: '📦', nf: '🎬', sp: '🎵',
  dc: '💬', wa: '💬', tg: '✈', gpt: '🤖', pin: '📌', tt: '🎵',
  npm: '📦', pypi: '🐍', codepen: '💻', figma: '🎨', notion: '📝', vercel: '▲',
}

export default function ShortcutsPanel() {
  const [shortcuts, setShortcuts] = useState([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetch('/api/shortcuts')
      .then((r) => r.json())
      .then((data) => setShortcuts(data.shortcuts || []))
      .catch(() => {})
  }, [])

  const filtered = shortcuts.filter(
    (s) =>
      s.key.toLowerCase().includes(filter.toLowerCase()) ||
      s.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="w-80 p-4 h-full flex flex-col">
      <h2 className="text-sm font-orbitron tracking-widest text-jarvis-cyan mb-3">
        QUICK SHORTCUTS
      </h2>

      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter shortcuts..."
        className="w-full bg-jarvis-panel border border-jarvis-border rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-jarvis-cyan/30 mb-3 font-rajdhani"
      />

      <div className="flex-1 overflow-y-auto space-y-1.5">
        {filtered.map((s, i) => (
          <motion.a
            key={s.key}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            className="flex items-center gap-3 px-3 py-2 rounded-lg border border-transparent hover:border-jarvis-cyan/20 hover:bg-jarvis-cyan/5 transition-all group cursor-pointer"
          >
            <span className="text-lg">{ICONS[s.key] || '🔗'}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-orbitron text-jarvis-cyan/70 tracking-wider">
                o {s.key}
              </div>
              <div className="text-xs text-gray-500 truncate font-rajdhani">
                {s.name}
              </div>
            </div>
            <span className="text-jarvis-cyan/0 group-hover:text-jarvis-cyan/40 transition-colors text-xs">
              →
            </span>
          </motion.a>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-jarvis-border/30 text-[10px] text-jarvis-cyan/30 font-orbitron tracking-widest text-center">
        {shortcuts.length} SHORTCUTS AVAILABLE
      </div>
    </div>
  )
}
