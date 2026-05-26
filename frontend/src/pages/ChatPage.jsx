import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import WaveformVisualizer from '../components/WaveformVisualizer'
import RadarDisplay from '../components/RadarDisplay'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: 'Good day. I am **J.A.R.V.I.S** — Just A Rather Very Intelligent System.\n\nI am at your service. You may ask me questions, search the web, control your desktop, or simply have a conversation.\n\nHow may I assist you today?',
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatPage({ backendStatus }) {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (content) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMessage = { role: 'user', content, timestamp }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const res = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: messages.filter(m => m.role !== 'system').slice(-10)
        })
      })

      if (!res.ok) throw new Error('Backend error')

      const data = await res.json()
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, assistantMessage])

      if (data.audio) {
        setIsSpeaking(true)
        setTimeout(() => setIsSpeaking(false), 3000)
      }
    } catch {
      const errorMessage = {
        role: 'assistant',
        content: backendStatus === 'offline'
          ? 'I apologize, but my backend systems are currently offline. Please ensure the server is running on port 3001.'
          : 'I encountered an error processing your request. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleVoice = () => {
    if (!isListening) {
      setIsListening(true)
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript
          sendMessage(transcript)
          setIsListening(false)
        }

        recognition.onerror = () => {
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.start()
      } else {
        setMessages(prev => [...prev, {
          role: 'system',
          content: 'Voice recognition is not supported in this browser.'
        }])
        setIsListening(false)
      }
    } else {
      setIsListening(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex"
    >
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-jarvis-muted text-sm font-mono"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-jarvis-cyan"
                  />
                ))}
              </div>
              <span>Processing...</span>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Waveform */}
        <div className="px-6">
          <WaveformVisualizer isActive={isListening || isSpeaking} size="sm" />
        </div>

        {/* Input */}
        <ChatInput
          onSend={sendMessage}
          isListening={isListening}
          onToggleVoice={toggleVoice}
          disabled={isLoading}
        />
      </div>

      {/* Right panel */}
      <div className="w-48 border-l border-jarvis-border/20 p-4 flex flex-col items-center gap-6">
        <RadarDisplay size={140} active={backendStatus === 'online'} />

        <div className="text-center space-y-3 w-full">
          <div className="glass-panel p-3 text-center">
            <div className="text-[10px] text-jarvis-muted font-mono mb-1">STATUS</div>
            <div className={`text-xs font-mono font-semibold ${
              backendStatus === 'online' ? 'text-jarvis-success' : 'text-jarvis-danger'
            }`}>
              {backendStatus.toUpperCase()}
            </div>
          </div>

          <div className="glass-panel p-3 text-center">
            <div className="text-[10px] text-jarvis-muted font-mono mb-1">MESSAGES</div>
            <div className="text-lg font-mono text-jarvis-cyan font-bold">
              {messages.length}
            </div>
          </div>

          <div className="glass-panel p-3 text-center">
            <div className="text-[10px] text-jarvis-muted font-mono mb-1">MODE</div>
            <div className={`text-xs font-mono font-semibold ${
              isListening ? 'text-jarvis-accent' : 'text-jarvis-text'
            }`}>
              {isListening ? 'VOICE' : 'TEXT'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
