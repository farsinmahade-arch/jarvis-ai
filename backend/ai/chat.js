const express = require('express')
const router = express.Router()
const OpenAI = require('openai')
const { loadMemory, saveMemory } = require('../memory/memory-store')

const SYSTEM_PROMPT = `You are JARVIS, an advanced AI assistant built by Stark Industries.
You are intelligent, calm, efficient, futuristic, and concise.
You help the user manage tasks, answer questions, search the web, and control the desktop.
Address the user as "Sir" unless they tell you otherwise.
Keep responses focused and helpful. Use a slightly formal but warm tone.`

let client = null

function getClient() {
  if (client) return client
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const baseURL = process.env.OPENAI_BASE_URL || undefined
  client = new OpenAI({ apiKey, baseURL })
  return client
}

// Fallback responses when no API key
const FALLBACK_RESPONSES = {
  hello: 'Hello, Sir. How may I assist you today?',
  hi: 'Good day, Sir. JARVIS at your service.',
  'how are you': 'All systems operational, Sir. Running at optimal efficiency.',
  thanks: 'You\'re welcome, Sir. Always happy to help.',
  'thank you': 'My pleasure, Sir.',
  'who are you': 'I am JARVIS — Just A Rather Very Intelligent System. Your personal AI assistant.',
  'what can you do': 'I can chat with you, search the web, open apps, manage your system, and much more. Type "help" for a full list of commands.',
  joke: 'Why do programmers prefer dark mode? Because light attracts bugs, Sir.',
  time: `The current time is ${new Date().toLocaleTimeString()}.`,
  date: `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
}

function getFallbackResponse(message) {
  const lower = message.toLowerCase().trim()
  for (const [key, response] of Object.entries(FALLBACK_RESPONSES)) {
    if (lower.includes(key)) return response
  }
  return `I understand, Sir. To unlock my full AI capabilities, please configure your OpenAI API key in the .env file (OPENAI_API_KEY). For now, I can still help with commands — type "help" to see what's available.`
}

// Inline command handling
const SHORTCUTS = {
  yt: 'https://www.youtube.com', g: 'https://www.google.com', gh: 'https://www.github.com',
  gm: 'https://mail.google.com', gd: 'https://drive.google.com', gp: 'https://photos.google.com',
  maps: 'https://maps.google.com', news: 'https://news.google.com', rd: 'https://www.reddit.com',
  tw: 'https://www.twitter.com', ig: 'https://www.instagram.com', fb: 'https://www.facebook.com',
  li: 'https://www.linkedin.com', so: 'https://stackoverflow.com', wp: 'https://www.wikipedia.org',
  amz: 'https://www.amazon.com', nf: 'https://www.netflix.com', sp: 'https://open.spotify.com',
  dc: 'https://discord.com/app', wa: 'https://web.whatsapp.com', tg: 'https://web.telegram.org',
  gpt: 'https://chat.openai.com', pin: 'https://www.pinterest.com', tt: 'https://www.tiktok.com',
  npm: 'https://www.npmjs.com', pypi: 'https://pypi.org', codepen: 'https://codepen.io',
  figma: 'https://www.figma.com', notion: 'https://www.notion.so', vercel: 'https://vercel.com',
}

function handleCommand(lower) {
  if (lower === 'help') {
    return {
      response: [
        '━━━ JARVIS COMMANDS ━━━', '',
        'help          — Show this help',
        'time          — Current time',
        'date          — Current date',
        'o <shortcut>  — Quick open (o yt, o g, o gh...)',
        'shortcuts     — List all shortcuts',
        'app <name>    — Launch app (code, chrome, files...)',
        'apps          — List all app shortcuts',
        'clear memory  — Clear conversation history',
        '', 'Or just type anything to chat with JARVIS AI.',
      ].join('\n'),
      type: 'command',
    }
  }
  if (lower === 'time') {
    return { response: `The current time is ${new Date().toLocaleTimeString()}.`, type: 'command' }
  }
  if (lower === 'date') {
    return {
      response: `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
      type: 'command',
    }
  }
  if (lower.startsWith('o ')) {
    const key = lower.slice(2).trim()
    const url = SHORTCUTS[key]
    if (url) return { response: `Opening ${url}`, type: 'shortcut', action: 'open_url', url }
    return { response: `Unknown shortcut "${key}". Type "shortcuts" to see available ones.`, type: 'error' }
  }
  if (lower === 'shortcuts') {
    const list = Object.entries(SHORTCUTS).map(([k, v]) => `  o ${k.padEnd(10)} → ${v}`).join('\n')
    return { response: `━━━ QUICK SHORTCUTS ━━━\n\n${list}`, type: 'command' }
  }
  return null
}

// Conversation history per session
const conversations = new Map()

router.post('/chat', async (req, res) => {
  const { message } = req.body
  if (!message) return res.status(400).json({ error: 'Message required' })

  const sessionId = req.sessionId || 'default'
  const lower = message.toLowerCase().trim()

  // Check for built-in commands first
  const cmdResponse = handleCommand(lower)
  if (cmdResponse) {
    return res.json(cmdResponse)
  }

  // Save to memory
  const memory = loadMemory()
  memory.history.push({ role: 'user', content: message, timestamp: new Date().toISOString() })
  saveMemory(memory)

  const openai = getClient()
  if (!openai) {
    const fallback = getFallbackResponse(message)
    memory.history.push({ role: 'assistant', content: fallback, timestamp: new Date().toISOString() })
    saveMemory(memory)
    return res.json({ response: fallback, type: 'fallback' })
  }

  // Build conversation
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, [])
  }
  const history = conversations.get(sessionId)
  history.push({ role: 'user', content: message })

  // Keep last 20 messages for context
  const trimmedHistory = history.slice(-20)

  try {
    const model = process.env.AI_MODEL || 'gpt-4.1-mini'
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...trimmedHistory,
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const reply = completion.choices[0].message.content
    history.push({ role: 'assistant', content: reply })
    conversations.set(sessionId, history.slice(-20))

    memory.history.push({ role: 'assistant', content: reply, timestamp: new Date().toISOString() })
    saveMemory(memory)

    res.json({ response: reply, type: 'ai' })
  } catch (err) {
    const fallback = getFallbackResponse(message)
    res.json({ response: fallback, type: 'fallback' })
  }
})

router.post('/clear-memory', (req, res) => {
  const sessionId = req.sessionId || 'default'
  conversations.delete(sessionId)
  const memory = loadMemory()
  memory.history = []
  saveMemory(memory)
  res.json({ success: true })
})

module.exports = router
