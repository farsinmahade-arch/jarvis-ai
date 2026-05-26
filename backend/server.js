const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const askJarvis = require('./ai/chat')
const searchInternet = require('./search/search')
const memory = require('./memory/memory')
const commands = require('./commands/commands')
const os = require('os')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() })
})

// System status
app.get('/api/status', (req, res) => {
  const cpus = os.cpus()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = ((totalMem - freeMem) / totalMem * 100).toFixed(1)

  const uptimeSec = os.uptime()
  const hours = Math.floor(uptimeSec / 3600)
  const mins = Math.floor((uptimeSec % 3600) / 60)

  res.json({
    cpu: (cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0)
      return acc + ((total - cpu.times.idle) / total * 100)
    }, 0) / cpus.length).toFixed(1),
    memory: usedMem,
    uptime: `${hours}h ${mins}m`,
    platform: `${os.platform()} ${os.arch()}`,
    hostname: os.hostname(),
    node_version: process.version,
  })
})

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body

    // Check for search intent
    let searchResults = null
    const searchKeywords = ['search', 'look up', 'find', 'google', 'what is', 'who is', 'latest news']
    const isSearchQuery = searchKeywords.some(kw => message.toLowerCase().includes(kw))

    if (isSearchQuery && process.env.SEARCHAPI_KEY) {
      try {
        searchResults = await searchInternet(message)
      } catch {
        // Search failed, proceed without it
      }
    }

    // Check for command intent
    const commandResult = commands.detectCommand(message)
    if (commandResult) {
      const output = await commands.execute(commandResult)
      memory.addToHistory('user', message)
      memory.addToHistory('assistant', output)
      return res.json({ response: output, type: 'command' })
    }

    // Get memory context
    const memoryContext = memory.getContext()

    const response = await askJarvis(message, history, searchResults, memoryContext)

    // Save to memory
    memory.addToHistory('user', message)
    memory.addToHistory('assistant', response)

    res.json({ response, type: 'chat' })
  } catch (error) {
    console.error('Chat error:', error.message)
    res.status(500).json({ error: 'Failed to process request', details: error.message })
  }
})

// Search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body
    const results = await searchInternet(query)
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: 'Search failed', details: error.message })
  }
})

// Memory endpoints
app.get('/api/memory', (req, res) => {
  res.json(memory.getAll())
})

app.post('/api/memory/fact', (req, res) => {
  const { key, value } = req.body
  memory.addFact(key, value)
  res.json({ success: true })
})

app.delete('/api/memory/history', (req, res) => {
  memory.clearHistory()
  res.json({ success: true })
})

// Settings endpoints
app.get('/api/settings', (req, res) => {
  res.json(memory.getSettings())
})

app.put('/api/settings', (req, res) => {
  memory.updateSettings(req.body)
  res.json({ success: true })
})

// Command execution
app.post('/api/command', async (req, res) => {
  try {
    const { command } = req.body
    const output = await commands.execute(command)
    res.json({ output })
  } catch (error) {
    res.status(500).json({ error: 'Command failed', details: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`[JARVIS Backend] Online on port ${PORT}`)
  console.log(`[JARVIS Backend] AI: ${process.env.OPENAI_API_KEY ? 'Configured' : 'No API key'}`)
  console.log(`[JARVIS Backend] Search: ${process.env.SEARCHAPI_KEY ? 'Configured' : 'Disabled'}`)
})
