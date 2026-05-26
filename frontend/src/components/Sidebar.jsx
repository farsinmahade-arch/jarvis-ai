import { motion } from 'framer-motion'
import { FiMessageSquare, FiActivity, FiDatabase, FiTerminal, FiSettings } from 'react-icons/fi'

const navItems = [
  { id: 'chat', label: 'Chat', icon: FiMessageSquare },
  { id: 'status', label: 'Status', icon: FiActivity },
  { id: 'memory', label: 'Memory', icon: FiDatabase },
  { id: 'commands', label: 'Commands', icon: FiTerminal },
  { id: 'settings', label: 'Settings', icon: FiSettings },
]

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <motion.nav
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="w-16 bg-jarvis-panel/50 border-r border-jarvis-border/30 flex flex-col items-center py-4 gap-2"
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activePage === item.id
        return (
          <motion.button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all group ${
              isActive
                ? 'bg-jarvis-cyan/10 text-jarvis-cyan shadow-glow'
                : 'text-jarvis-muted hover:text-jarvis-cyan hover:bg-jarvis-cyan/5'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute left-0 w-0.5 h-6 bg-jarvis-cyan rounded-r"
              />
            )}
            <Icon size={20} />
            <div className="absolute left-14 px-2 py-1 bg-jarvis-panel border border-jarvis-border rounded text-xs text-jarvis-text whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {item.label}
            </div>
          </motion.button>
        )
      })}
    </motion.nav>
  )
}
