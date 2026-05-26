const express = require('express')
const router = express.Router()
const { exec } = require('child_process')
const os = require('os')

const SHORTCUTS = {
  yt: 'https://www.youtube.com',
  g: 'https://www.google.com',
  gh: 'https://www.github.com',
  gm: 'https://mail.google.com',
  gd: 'https://drive.google.com',
  gp: 'https://photos.google.com',
  maps: 'https://maps.google.com',
  news: 'https://news.google.com',
  rd: 'https://www.reddit.com',
  tw: 'https://www.twitter.com',
  ig: 'https://www.instagram.com',
  fb: 'https://www.facebook.com',
  li: 'https://www.linkedin.com',
  so: 'https://stackoverflow.com',
  wp: 'https://www.wikipedia.org',
  amz: 'https://www.amazon.com',
  nf: 'https://www.netflix.com',
  sp: 'https://open.spotify.com',
  dc: 'https://discord.com/app',
  wa: 'https://web.whatsapp.com',
  tg: 'https://web.telegram.org',
  gpt: 'https://chat.openai.com',
  pin: 'https://www.pinterest.com',
  tt: 'https://www.tiktok.com',
  npm: 'https://www.npmjs.com',
  pypi: 'https://pypi.org',
  codepen: 'https://codepen.io',
  figma: 'https://www.figma.com',
  notion: 'https://www.notion.so',
  vercel: 'https://vercel.com',
}

const APP_COMMANDS = {
  chrome: { linux: 'google-chrome', darwin: 'open -a "Google Chrome"', win32: 'start chrome' },
  code: { linux: 'code', darwin: 'open -a "Visual Studio Code"', win32: 'code' },
  firefox: { linux: 'firefox', darwin: 'open -a Firefox', win32: 'start firefox' },
  terminal: { linux: 'gnome-terminal', darwin: 'open -a Terminal', win32: 'start cmd' },
  files: { linux: 'nautilus', darwin: 'open ~', win32: 'explorer' },
  calc: { linux: 'gnome-calculator', darwin: 'open -a Calculator', win32: 'calc' },
  notepad: { linux: 'gedit', darwin: 'open -a TextEdit', win32: 'notepad' },
  music: { linux: 'rhythmbox', darwin: 'open -a Music', win32: 'start wmplayer' },
  settings: { linux: 'gnome-control-center', darwin: 'open -a "System Preferences"', win32: 'start ms-settings:' },
}

router.get('/shortcuts', (req, res) => {
  const list = Object.entries(SHORTCUTS).map(([key, url]) => ({
    key,
    url,
    name: url.replace('https://', '').replace('http://', '').replace('www.', '').replace(/\/$/, ''),
  }))
  res.json({ shortcuts: list })
})

router.post('/command', (req, res) => {
  const { command } = req.body
  if (!command) return res.status(400).json({ error: 'Command required' })

  const lower = command.toLowerCase().trim()

  // Shortcut: o <key>
  if (lower.startsWith('o ')) {
    const key = lower.slice(2).trim()
    const url = SHORTCUTS[key]
    if (url) {
      return res.json({ response: `Opening ${url}...`, type: 'shortcut', action: 'open_url', url })
    }
    return res.json({ response: `Unknown shortcut "${key}". Type "shortcuts" to see available ones.`, type: 'error' })
  }

  // App launch
  if (lower.startsWith('app ')) {
    const appName = lower.slice(4).trim()
    const appCmd = APP_COMMANDS[appName]
    if (!appCmd) {
      return res.json({ response: `Unknown app "${appName}". Available: ${Object.keys(APP_COMMANDS).join(', ')}`, type: 'error' })
    }
    const platform = os.platform()
    const cmd = appCmd[platform] || appCmd.linux
    if (cmd) {
      exec(cmd, (err) => {
        if (err) {
          return res.json({ response: `Failed to launch ${appName}.`, type: 'error' })
        }
      })
      return res.json({ response: `Launching ${appName}...`, type: 'command' })
    }
    return res.json({ response: `No command for "${appName}" on this platform.`, type: 'error' })
  }

  // Time
  if (lower === 'time') {
    return res.json({ response: `The current time is ${new Date().toLocaleTimeString()}.`, type: 'command' })
  }

  // Date
  if (lower === 'date') {
    return res.json({
      response: `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
      type: 'command',
    })
  }

  // Help
  if (lower === 'help') {
    const helpText = [
      '━━━ JARVIS COMMANDS ━━━',
      '',
      'help          — Show this help',
      'time          — Current time',
      'date          — Current date',
      'o <shortcut>  — Quick open (o yt, o g, o gh...)',
      'shortcuts     — List all shortcuts',
      'app <name>    — Launch app (code, chrome, files...)',
      'apps          — List all app shortcuts',
      'clear memory  — Clear conversation history',
      '',
      'Or just type anything to chat with JARVIS AI.',
    ].join('\n')
    return res.json({ response: helpText, type: 'command' })
  }

  // Shortcuts list
  if (lower === 'shortcuts') {
    const list = Object.entries(SHORTCUTS)
      .map(([k, v]) => `  o ${k.padEnd(10)} → ${v}`)
      .join('\n')
    return res.json({ response: `━━━ QUICK SHORTCUTS ━━━\n\n${list}`, type: 'command' })
  }

  // Apps list
  if (lower === 'apps') {
    const list = Object.keys(APP_COMMANDS).map((k) => `  app ${k}`).join('\n')
    return res.json({ response: `━━━ APP SHORTCUTS ━━━\n\n${list}`, type: 'command' })
  }

  // Shutdown command
  if (lower === 'shutdown pc' || lower === 'shutdown computer') {
    return res.json({ response: 'PC shutdown is disabled in the web interface for safety, Sir.', type: 'command' })
  }

  return res.json({ response: null, type: 'not_command' })
})

module.exports = router
