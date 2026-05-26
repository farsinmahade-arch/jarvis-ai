const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const chatRouter = require('./ai/chat')
const memoryRouter = require('./memory/memory')
const commandsRouter = require('./commands/commands')
const searchRouter = require('./search/search')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Simple session store (in-memory for now)
const sessions = {}

function sessionMiddleware(req, res, next) {
  const sid = req.headers['x-session-id'] || 'default'
  if (!sessions[sid]) {
    sessions[sid] = { authenticated: false, loginTime: null }
  }
  req.session = sessions[sid]
  req.sessionId = sid
  next()
}
app.use(sessionMiddleware)

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session.authenticated) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  next()
}

// Auth routes
const { PasswordManager } = require('./auth')
const passwordManager = new PasswordManager()

app.get('/api/auth/status', (req, res) => {
  res.json({
    authenticated: req.session.authenticated,
    password_configured: passwordManager.isConfigured,
    password_enabled: true,
  })
})

app.post('/api/auth/setup', (req, res) => {
  const { password } = req.body || {}
  if (!password) return res.status(400).json({ error: 'Password required' })
  if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters' })
  if (passwordManager.isConfigured) return res.status(409).json({ error: 'Password already configured' })

  passwordManager.setup(password)
  req.session.authenticated = true
  req.session.loginTime = new Date().toISOString()

  const greeting = getGreeting()
  res.json({ success: true, greeting })
})

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body || {}
  if (!password) return res.status(400).json({ error: 'Password required' })

  if (passwordManager.isLockedOut) {
    const remaining = passwordManager.lockoutRemaining
    return res.status(423).json({
      error: `Account locked. Try again in ${remaining} seconds.`,
      locked: true,
      remaining,
    })
  }

  if (passwordManager.verify(password)) {
    req.session.authenticated = true
    req.session.loginTime = new Date().toISOString()
    const greeting = getGreeting()
    res.json({ success: true, greeting })
  } else {
    const remaining = passwordManager.attemptsRemaining
    res.status(401).json({
      error: `Incorrect password. ${remaining} attempts remaining.`,
      attempts_remaining: remaining,
    })
  }
})

app.post('/api/auth/logout', (req, res) => {
  req.session.authenticated = false
  req.session.loginTime = null
  res.json({ success: true })
})

// Greeting helper
function getGreeting() {
  const hour = new Date().getHours()
  let timeGreeting
  if (hour < 6) timeGreeting = 'Working late'
  else if (hour < 12) timeGreeting = 'Good morning'
  else if (hour < 17) timeGreeting = 'Good afternoon'
  else if (hour < 21) timeGreeting = 'Good evening'
  else timeGreeting = 'Good evening'

  return `${timeGreeting}, Sir. JARVIS is online and all systems are operational.`
}

// API routes
app.get('/api/greeting', requireAuth, (req, res) => {
  res.json({
    greeting: getGreeting(),
    wake_up: `Welcome back, Sir. ${getGreeting()}`,
  })
})

app.use('/api', requireAuth, chatRouter)
app.use('/api', requireAuth, memoryRouter)
app.use('/api', requireAuth, commandsRouter)
app.use('/api', requireAuth, searchRouter)

// System status
const os = require('os')
app.get('/api/system', requireAuth, (req, res) => {
  const cpus = os.cpus()
  const totalMem = os.totalmem()
  const freeMem = os.freemem()
  const usedMem = totalMem - freeMem

  // Calculate CPU usage from idle
  let totalIdle = 0
  let totalTick = 0
  for (const cpu of cpus) {
    for (const type in cpu.times) {
      totalTick += cpu.times[type]
    }
    totalIdle += cpu.times.idle
  }
  const cpuPercent = Math.round(((totalTick - totalIdle) / totalTick) * 100)

  res.json({
    cpu_percent: cpuPercent,
    ram_percent: Math.round((usedMem / totalMem) * 100),
    ram_used_gb: (usedMem / (1024 ** 3)).toFixed(1),
    ram_total_gb: (totalMem / (1024 ** 3)).toFixed(1),
  })
})

// Settings
const { loadConfig } = require('./memory/config')
app.get('/api/settings', requireAuth, (req, res) => {
  const config = loadConfig()
  res.json({
    assistant_name: config.assistant_name || 'JARVIS',
    owner_name: config.owner_name || 'Sir',
    wake_word: config.wake_word || 'jarvis',
    ai_provider: config.ai_provider || 'openai',
    ai_model: config.ai_model || 'gpt-4.1-mini',
    theme_color: config.theme_color || 'cyan',
  })
})

app.listen(PORT, () => {
  console.log(`\n  JARVIS Backend running on http://localhost:${PORT}\n`)
})
