import { motion } from 'framer-motion'

export default function TitleBar({ backendStatus }) {
  const statusColor = {
    online: 'bg-jarvis-success',
    connecting: 'bg-jarvis-accent',
    offline: 'bg-jarvis-danger'
  }

  const statusLabel = {
    online: 'ONLINE',
    connecting: 'CONNECTING...',
    offline: 'OFFLINE'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-10 bg-jarvis-panel/90 border-b border-jarvis-border/30 flex items-center justify-between px-4 select-none"
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-jarvis-cyan animate-pulse-glow" />
        <span className="text-xs font-mono text-jarvis-cyan tracking-[0.3em] font-semibold">
          J.A.R.V.I.S
        </span>
        <span className="text-[10px] font-mono text-jarvis-muted ml-2">
          v1.0.0
        </span>
      </div>

      <div className="flex items-center gap-4" style={{ WebkitAppRegion: 'no-drag' }}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor[backendStatus]}`} />
          <span className="text-[10px] font-mono text-jarvis-muted">
            {statusLabel[backendStatus]}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => window.electronAPI?.minimizeWindow()}
            className="w-3 h-3 rounded-full bg-jarvis-accent/80 hover:bg-jarvis-accent transition-colors"
          />
          <button
            onClick={() => window.electronAPI?.maximizeWindow()}
            className="w-3 h-3 rounded-full bg-jarvis-success/80 hover:bg-jarvis-success transition-colors"
          />
          <button
            onClick={() => window.electronAPI?.closeWindow()}
            className="w-3 h-3 rounded-full bg-jarvis-danger/80 hover:bg-jarvis-danger transition-colors"
          />
        </div>
      </div>
    </motion.div>
  )
}
