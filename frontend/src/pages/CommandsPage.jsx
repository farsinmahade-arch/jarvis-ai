import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlay, FiTerminal, FiMonitor, FiVolume2, FiPower, FiGlobe, FiFolder, FiClock } from 'react-icons/fi'

const commandGroups = [
  {
    title: 'Applications',
    icon: FiMonitor,
    commands: [
      { name: 'Open Browser', command: 'open_browser', description: 'Launch default web browser', icon: FiGlobe },
      { name: 'Open File Manager', command: 'open_files', description: 'Open file explorer', icon: FiFolder },
      { name: 'Open Terminal', command: 'open_terminal', description: 'Launch terminal', icon: FiTerminal },
    ]
  },
  {
    title: 'System',
    icon: FiPower,
    commands: [
      { name: 'Lock Screen', command: 'lock_screen', description: 'Lock the computer', icon: FiPower },
      { name: 'Volume Up', command: 'volume_up', description: 'Increase system volume', icon: FiVolume2 },
      { name: 'Volume Down', command: 'volume_down', description: 'Decrease system volume', icon: FiVolume2 },
      { name: 'Current Time', command: 'get_time', description: 'Get current date & time', icon: FiClock },
    ]
  }
]

export default function CommandsPage() {
  const [output, setOutput] = useState('')
  const [executing, setExecuting] = useState(null)

  const executeCommand = async (cmd) => {
    setExecuting(cmd.command)
    setOutput(`Executing: ${cmd.name}...`)

    try {
      const res = await fetch('http://localhost:3001/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd.command })
      })

      if (res.ok) {
        const data = await res.json()
        setOutput(`> ${cmd.name}\n${data.output || 'Command executed successfully.'}`)
      } else {
        setOutput(`> ${cmd.name}\nError: Command failed.`)
      }
    } catch {
      setOutput(`> ${cmd.name}\nError: Backend offline.`)
    } finally {
      setExecuting(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto p-6"
    >
      <h2 className="text-2xl font-bold text-jarvis-cyan glow-text font-mono tracking-wider mb-6">
        DESKTOP AUTOMATION
      </h2>

      <div className="space-y-6 mb-6">
        {commandGroups.map((group) => {
          const GroupIcon = group.icon
          return (
            <div key={group.title} className="glass-panel p-6">
              <div className="flex items-center gap-2 mb-4">
                <GroupIcon size={16} className="text-jarvis-cyan" />
                <h3 className="text-sm font-mono text-jarvis-muted tracking-wider">{group.title.toUpperCase()}</h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {group.commands.map((cmd) => {
                  const CmdIcon = cmd.icon
                  return (
                    <motion.button
                      key={cmd.command}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => executeCommand(cmd)}
                      disabled={executing !== null}
                      className="bg-jarvis-bg/50 border border-jarvis-border/20 rounded-xl p-4 text-left hover:border-jarvis-cyan/30 hover:bg-jarvis-cyan/5 transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <CmdIcon size={16} className="text-jarvis-muted group-hover:text-jarvis-cyan transition-colors" />
                        <span className="text-sm font-mono text-jarvis-text">{cmd.name}</span>
                      </div>
                      <p className="text-[10px] text-jarvis-muted">{cmd.description}</p>
                      {executing === cmd.command && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          className="h-0.5 bg-jarvis-cyan mt-2 rounded-full"
                          transition={{ duration: 2 }}
                        />
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Output terminal */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-3">
          <FiTerminal size={14} className="text-jarvis-cyan" />
          <h3 className="text-sm font-mono text-jarvis-muted tracking-wider">OUTPUT</h3>
        </div>
        <div className="bg-jarvis-bg/80 rounded-lg p-4 border border-jarvis-border/10 min-h-[120px]">
          <pre className="text-xs font-mono text-jarvis-text whitespace-pre-wrap">
            {output || '> Awaiting command...'}
          </pre>
        </div>
      </div>
    </motion.div>
  )
}
