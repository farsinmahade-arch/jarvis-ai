const fs = require('fs')
const path = require('path')

const DB_DIR = path.join(__dirname, '..', '..', 'database')
const MEMORY_FILE = path.join(DB_DIR, 'memory.json')
const SETTINGS_FILE = path.join(DB_DIR, 'settings.json')

const DEFAULT_MEMORY = {
  name: 'User',
  preferences: {
    theme: 'dark blue'
  },
  facts: [],
  history: []
}

const DEFAULT_SETTINGS = {
  assistant_name: 'JARVIS',
  owner_name: 'Sir',
  wake_word: 'hey jarvis',
  ai_model: 'gpt-4.1-mini',
  voice_enabled: true,
  voice_speed: 1.0,
  tts_provider: 'browser',
  stt_provider: 'browser',
  search_enabled: true,
}

function ensureDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }
}

function loadMemory() {
  ensureDir()
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'))
    }
  } catch {
    // Corrupted file, reset
  }
  return { ...DEFAULT_MEMORY }
}

function saveMemory(data) {
  ensureDir()
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2))
}

function loadSettings() {
  ensureDir()
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'))
    }
  } catch {
    // Corrupted file, reset
  }
  return { ...DEFAULT_SETTINGS }
}

function saveSettings(data) {
  ensureDir()
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2))
}

module.exports = {
  getAll() {
    const mem = loadMemory()
    return {
      name: mem.name,
      preferences: mem.preferences,
      facts: mem.facts || [],
      history_count: (mem.history || []).length
    }
  },

  addFact(key, value) {
    const mem = loadMemory()
    if (!mem.facts) mem.facts = []
    const existing = mem.facts.findIndex(f => f.key === key)
    if (existing >= 0) {
      mem.facts[existing].value = value
    } else {
      mem.facts.push({ key, value, added: new Date().toISOString() })
    }
    saveMemory(mem)
  },

  addToHistory(role, content) {
    const mem = loadMemory()
    if (!mem.history) mem.history = []
    mem.history.push({
      role,
      content,
      timestamp: new Date().toISOString()
    })
    // Keep last 100 entries
    if (mem.history.length > 100) {
      mem.history = mem.history.slice(-100)
    }
    saveMemory(mem)
  },

  clearHistory() {
    const mem = loadMemory()
    mem.history = []
    saveMemory(mem)
  },

  getContext() {
    const mem = loadMemory()
    const settings = loadSettings()
    const parts = []

    if (mem.name && mem.name !== 'User') {
      parts.push(`User's name is ${mem.name}.`)
    }

    parts.push(`User prefers to be called "${settings.owner_name}".`)

    if (mem.facts && mem.facts.length > 0) {
      const factStr = mem.facts.map(f => `${f.key}: ${f.value}`).join(', ')
      parts.push(`Known facts: ${factStr}.`)
    }

    return parts.length > 0 ? parts.join(' ') : null
  },

  getSettings() {
    return loadSettings()
  },

  updateSettings(newSettings) {
    const current = loadSettings()
    const updated = { ...current, ...newSettings }
    saveSettings(updated)
    return updated
  }
}
