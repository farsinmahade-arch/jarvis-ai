import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const bootSequence = [
  { text: 'Initializing J.A.R.V.I.S core systems...', delay: 0 },
  { text: 'Loading neural network modules...', delay: 400 },
  { text: 'Connecting to AI brain...', delay: 800 },
  { text: 'Calibrating voice recognition...', delay: 1200 },
  { text: 'Loading memory banks...', delay: 1600 },
  { text: 'Establishing search protocols...', delay: 2000 },
  { text: 'Activating desktop automation...', delay: 2400 },
  { text: 'All systems operational.', delay: 2800 },
]

export default function BootScreen({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    bootSequence.forEach((item, index) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, item.text])
        setProgress(((index + 1) / bootSequence.length) * 100)
      }, item.delay)
    })

    setTimeout(onComplete, 3800)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="h-screen w-screen bg-jarvis-bg flex flex-col items-center justify-center relative z-20"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="mb-12"
      >
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-2 border-jarvis-cyan/30 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border border-jarvis-cyan/50 flex items-center justify-center animate-spin-slow">
              <div className="w-16 h-16 rounded-full border border-jarvis-cyan/70 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-8 h-8 rounded-full bg-jarvis-cyan/80 shadow-glow-lg"
                />
              </div>
            </div>
          </div>
          <div className="absolute inset-0 rounded-full animate-pulse-glow" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-5xl font-bold tracking-[0.5em] text-jarvis-cyan glow-text mb-8 font-mono"
      >
        JARVIS
      </motion.h1>

      <div className="w-96 space-y-1 font-mono text-xs">
        {visibleLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-2 ${
              i === visibleLines.length - 1 && i === bootSequence.length - 1
                ? 'text-jarvis-success'
                : 'text-jarvis-muted'
            }`}
          >
            <span className="text-jarvis-cyan">{'>'}</span>
            {line}
          </motion.div>
        ))}
      </div>

      <div className="w-96 mt-6">
        <div className="h-1 bg-jarvis-border/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-jarvis-cyan to-jarvis-blue rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-right text-[10px] text-jarvis-muted mt-1 font-mono">
          {Math.round(progress)}%
        </div>
      </div>
    </motion.div>
  )
}
