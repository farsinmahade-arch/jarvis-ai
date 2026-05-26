const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', '..', 'database')
const CONFIG_FILE = path.join(DATA_DIR, 'config.json')

const DEFAULT_CONFIG = {
  assistant_name: 'JARVIS',
  owner_name: 'Sir',
  wake_word: 'jarvis',
  ai_provider: 'openai',
  ai_model: 'gpt-4.1-mini',
  theme_color: 'cyan',
}

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) }
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_CONFIG }
}

function saveConfig(config) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2))
}

module.exports = { loadConfig, saveConfig, DEFAULT_CONFIG }
