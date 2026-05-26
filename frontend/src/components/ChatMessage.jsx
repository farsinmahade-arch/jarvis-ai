import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-2"
      >
        <div className="text-[11px] text-jarvis-muted font-mono bg-jarvis-panel/50 px-3 py-1 rounded-full border border-jarvis-border/20">
          {message.content}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[75%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            isUser
              ? 'bg-jarvis-blue/20 text-jarvis-blue border border-jarvis-blue/30'
              : 'bg-jarvis-cyan/20 text-jarvis-cyan border border-jarvis-cyan/30'
          }`}>
            {isUser ? 'U' : 'J'}
          </div>
          <span className="text-[10px] text-jarvis-muted font-mono">
            {isUser ? 'YOU' : 'JARVIS'}
          </span>
          <span className="text-[9px] text-jarvis-muted/50 font-mono">
            {message.timestamp}
          </span>
        </div>

        <div className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${
          isUser
            ? 'bg-jarvis-blue/10 border border-jarvis-blue/20 text-jarvis-text'
            : 'bg-jarvis-panel/80 border border-jarvis-border/30 text-jarvis-text glow-border'
        }`}>
          <ReactMarkdown
            components={{
              code: ({ children }) => (
                <code className="bg-jarvis-bg/50 px-1.5 py-0.5 rounded text-jarvis-cyan font-mono text-xs">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-jarvis-bg/80 p-3 rounded-lg my-2 overflow-x-auto border border-jarvis-border/20">
                  {children}
                </pre>
              ),
              p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </motion.div>
  )
}
