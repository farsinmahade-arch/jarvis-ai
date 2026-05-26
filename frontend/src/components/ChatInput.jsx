import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiMic, FiMicOff } from 'react-icons/fi'

export default function ChatInput({ onSend, isListening, onToggleVoice, disabled }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || disabled) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      onSubmit={handleSubmit}
      className="flex items-center gap-3 p-4 border-t border-jarvis-border/20"
    >
      <motion.button
        type="button"
        onClick={onToggleVoice}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
          isListening
            ? 'bg-jarvis-danger/20 text-jarvis-danger border border-jarvis-danger/30 animate-pulse'
            : 'bg-jarvis-panel/80 text-jarvis-muted border border-jarvis-border/30 hover:text-jarvis-cyan hover:border-jarvis-cyan/30'
        }`}
      >
        {isListening ? <FiMicOff size={18} /> : <FiMic size={18} />}
      </motion.button>

      <div className="flex-1 relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? 'Listening...' : 'Ask JARVIS anything...'}
          disabled={disabled}
          className="w-full bg-jarvis-panel/60 border border-jarvis-border/30 rounded-xl px-4 py-2.5 text-sm text-jarvis-text placeholder-jarvis-muted/50 font-mono focus:outline-none focus:border-jarvis-cyan/50 focus:shadow-glow transition-all disabled:opacity-50"
        />
        {isListening && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-0.5">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                animate={{ height: [4, 16, 4] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                className="w-0.5 bg-jarvis-cyan rounded-full"
              />
            ))}
          </div>
        )}
      </div>

      <motion.button
        type="submit"
        disabled={!input.trim() || disabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-10 h-10 rounded-xl bg-jarvis-cyan/10 text-jarvis-cyan border border-jarvis-cyan/30 flex items-center justify-center hover:bg-jarvis-cyan/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <FiSend size={18} />
      </motion.button>
    </motion.form>
  )
}
