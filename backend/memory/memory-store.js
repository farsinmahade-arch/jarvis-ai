const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', '..', 'database')
const MEMORY_FILE = path.join(DATA_DIR, 'memory.json')

const DEFAULT_MEMORY = {
  name: 'Sir',
  preferences: {
    theme: 'dark blue',
  },
  history: [],
}

function loadMemory() {
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      return JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf8'))
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_MEMORY, history: [] }
}

function saveMemory(memory) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  // Keep only last 100 history entries
  if (memory.history && memory.history.length > 100) {
    memory.history = memory.history.slice(-100)
  }
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2))
}

module.exports = { loadMemory, saveMemory }
