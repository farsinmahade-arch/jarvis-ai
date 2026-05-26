const { exec } = require('child_process')
const os = require('os')

const platform = os.platform()

const COMMAND_MAP = {
  open_browser: {
    win32: 'start chrome',
    darwin: 'open -a "Google Chrome"',
    linux: 'xdg-open http://google.com'
  },
  open_files: {
    win32: 'explorer .',
    darwin: 'open .',
    linux: 'xdg-open .'
  },
  open_terminal: {
    win32: 'start cmd',
    darwin: 'open -a Terminal',
    linux: 'x-terminal-emulator'
  },
  lock_screen: {
    win32: 'rundll32.exe user32.dll,LockWorkStation',
    darwin: 'pmset displaysleepnow',
    linux: 'xdg-screensaver lock'
  },
  volume_up: {
    win32: 'powershell (New-Object -ComObject WScript.Shell).SendKeys([char]175)',
    darwin: 'osascript -e "set volume output volume ((output volume of (get volume settings)) + 10)"',
    linux: 'amixer set Master 10%+'
  },
  volume_down: {
    win32: 'powershell (New-Object -ComObject WScript.Shell).SendKeys([char]174)',
    darwin: 'osascript -e "set volume output volume ((output volume of (get volume settings)) - 10)"',
    linux: 'amixer set Master 10%-'
  },
  get_time: {
    all: () => {
      const now = new Date()
      return `Current time: ${now.toLocaleString()}`
    }
  },
  shutdown: {
    win32: 'shutdown /s /t 30',
    darwin: 'sudo shutdown -h +1',
    linux: 'sudo shutdown -h +1'
  },
  restart: {
    win32: 'shutdown /r /t 30',
    darwin: 'sudo shutdown -r +1',
    linux: 'sudo shutdown -r +1'
  }
}

const COMMAND_DETECTION = [
  { patterns: ['open browser', 'open chrome', 'launch browser'], command: 'open_browser' },
  { patterns: ['open files', 'file manager', 'file explorer', 'open explorer'], command: 'open_files' },
  { patterns: ['open terminal', 'launch terminal', 'open cmd'], command: 'open_terminal' },
  { patterns: ['lock screen', 'lock computer', 'lock pc'], command: 'lock_screen' },
  { patterns: ['volume up', 'louder', 'increase volume'], command: 'volume_up' },
  { patterns: ['volume down', 'quieter', 'decrease volume'], command: 'volume_down' },
  { patterns: ['what time', 'current time', 'tell me the time'], command: 'get_time' },
]

function detectCommand(message) {
  const lower = message.toLowerCase()
  for (const entry of COMMAND_DETECTION) {
    if (entry.patterns.some(p => lower.includes(p))) {
      return entry.command
    }
  }
  return null
}

function execute(commandKey) {
  return new Promise((resolve, reject) => {
    const cmdConfig = COMMAND_MAP[commandKey]
    if (!cmdConfig) {
      return reject(new Error(`Unknown command: ${commandKey}`))
    }

    // Handle built-in commands
    if (cmdConfig.all && typeof cmdConfig.all === 'function') {
      return resolve(cmdConfig.all())
    }

    const cmd = cmdConfig[platform]
    if (!cmd) {
      return resolve(`Command not supported on ${platform}`)
    }

    exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        resolve(`Command executed (may require user interaction): ${commandKey}`)
      } else {
        resolve(stdout || `Executed: ${commandKey}`)
      }
    })
  })
}

module.exports = { detectCommand, execute }
