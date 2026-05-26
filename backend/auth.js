const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'database')
const AUTH_FILE = path.join(DATA_DIR, 'auth.json')

class PasswordManager {
  constructor() {
    this._maxAttempts = 3
    this._lockoutDuration = 300 // seconds
    this._failedAttempts = 0
    this._lockoutTime = null
    this._load()
  }

  get isConfigured() {
    return !!this._hash
  }

  get isLockedOut() {
    if (!this._lockoutTime) return false
    const elapsed = (Date.now() - this._lockoutTime) / 1000
    if (elapsed >= this._lockoutDuration) {
      this._lockoutTime = null
      this._failedAttempts = 0
      return false
    }
    return true
  }

  get lockoutRemaining() {
    if (!this._lockoutTime) return 0
    return Math.ceil(this._lockoutDuration - (Date.now() - this._lockoutTime) / 1000)
  }

  get attemptsRemaining() {
    return Math.max(0, this._maxAttempts - this._failedAttempts)
  }

  setup(password) {
    const salt = crypto.randomBytes(32).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
    this._salt = salt
    this._hash = hash
    this._save()
  }

  verify(password) {
    if (!this._hash || !this._salt) return false
    const hash = crypto.pbkdf2Sync(password, this._salt, 100000, 64, 'sha512').toString('hex')
    if (hash === this._hash) {
      this._failedAttempts = 0
      this._lockoutTime = null
      return true
    }
    this._failedAttempts++
    if (this._failedAttempts >= this._maxAttempts) {
      this._lockoutTime = Date.now()
    }
    return false
  }

  _load() {
    try {
      if (fs.existsSync(AUTH_FILE)) {
        const data = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'))
        this._hash = data.hash
        this._salt = data.salt
      }
    } catch {
      this._hash = null
      this._salt = null
    }
  }

  _save() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ hash: this._hash, salt: this._salt }, null, 2))
  }
}

module.exports = { PasswordManager }
