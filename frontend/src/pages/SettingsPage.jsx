import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSave, FiRefreshCw } from 'react-icons/fi'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    assistant_name: 'JARVIS',
    owner_name: 'Sir',
    wake_word: 'hey jarvis',
    ai_model: 'gpt-4.1-mini',
    voice_enabled: true,
    voice_speed: 1.0,
    tts_provider: 'browser',
    stt_provider: 'browser',
    search_enabled: true,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/settings')
        if (res.ok) {
          const data = await res.json()
          setSettings(prev => ({ ...prev, ...data }))
        }
      } catch {
        // Use defaults
      }
    }
    fetchSettings()
  }, [])

  const saveSettings = async () => {
    try {
      await fetch('http://localhost:3001/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // Handle error
    }
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-jarvis-cyan glow-text font-mono tracking-wider">
          SETTINGS
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={saveSettings}
          className={`px-4 py-2 rounded-lg text-sm font-mono flex items-center gap-2 transition-all ${
            saved
              ? 'bg-jarvis-success/20 text-jarvis-success border border-jarvis-success/30'
              : 'bg-jarvis-cyan/10 text-jarvis-cyan border border-jarvis-cyan/30 hover:bg-jarvis-cyan/20'
          }`}
        >
          <FiSave size={14} />
          {saved ? 'SAVED' : 'SAVE'}
        </motion.button>
      </div>

      <div className="space-y-6">
        {/* Identity */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-mono text-jarvis-muted mb-4 tracking-wider">IDENTITY</h3>
          <div className="space-y-4">
            <SettingInput
              label="Assistant Name"
              value={settings.assistant_name}
              onChange={(v) => updateSetting('assistant_name', v)}
            />
            <SettingInput
              label="Owner Name"
              value={settings.owner_name}
              onChange={(v) => updateSetting('owner_name', v)}
            />
            <SettingInput
              label="Wake Word"
              value={settings.wake_word}
              onChange={(v) => updateSetting('wake_word', v)}
            />
          </div>
        </div>

        {/* AI */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-mono text-jarvis-muted mb-4 tracking-wider">AI ENGINE</h3>
          <div className="space-y-4">
            <SettingSelect
              label="AI Model"
              value={settings.ai_model}
              options={[
                { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
                { value: 'gpt-4.1', label: 'GPT-4.1' },
                { value: 'gpt-4o', label: 'GPT-4o' },
                { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
              ]}
              onChange={(v) => updateSetting('ai_model', v)}
            />
          </div>
        </div>

        {/* Voice */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-mono text-jarvis-muted mb-4 tracking-wider">VOICE</h3>
          <div className="space-y-4">
            <SettingToggle
              label="Voice Enabled"
              value={settings.voice_enabled}
              onChange={(v) => updateSetting('voice_enabled', v)}
            />
            <SettingRange
              label="Voice Speed"
              value={settings.voice_speed}
              min={0.5}
              max={2.0}
              step={0.1}
              onChange={(v) => updateSetting('voice_speed', parseFloat(v))}
            />
            <SettingSelect
              label="TTS Provider"
              value={settings.tts_provider}
              options={[
                { value: 'browser', label: 'Browser (Free)' },
                { value: 'elevenlabs', label: 'ElevenLabs (API Key Required)' },
              ]}
              onChange={(v) => updateSetting('tts_provider', v)}
            />
            <SettingSelect
              label="STT Provider"
              value={settings.stt_provider}
              options={[
                { value: 'browser', label: 'Browser (Free)' },
                { value: 'deepgram', label: 'Deepgram (API Key Required)' },
              ]}
              onChange={(v) => updateSetting('stt_provider', v)}
            />
          </div>
        </div>

        {/* Search */}
        <div className="glass-panel p-6">
          <h3 className="text-sm font-mono text-jarvis-muted mb-4 tracking-wider">SEARCH</h3>
          <SettingToggle
            label="Web Search Enabled"
            value={settings.search_enabled}
            onChange={(v) => updateSetting('search_enabled', v)}
          />
        </div>
      </div>
    </motion.div>
  )
}

function SettingInput({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-mono text-jarvis-text">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-48 bg-jarvis-bg/50 border border-jarvis-border/30 rounded-lg px-3 py-1.5 text-sm text-jarvis-text font-mono focus:outline-none focus:border-jarvis-cyan/50"
      />
    </div>
  )
}

function SettingSelect({ label, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-mono text-jarvis-text">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-48 bg-jarvis-bg/50 border border-jarvis-border/30 rounded-lg px-3 py-1.5 text-sm text-jarvis-text font-mono focus:outline-none focus:border-jarvis-cyan/50"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function SettingToggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-mono text-jarvis-text">{label}</label>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-all relative ${
          value ? 'bg-jarvis-cyan/30 border-jarvis-cyan/50' : 'bg-jarvis-bg/50 border-jarvis-border/30'
        } border`}
      >
        <motion.div
          animate={{ x: value ? 24 : 2 }}
          className={`w-4 h-4 rounded-full absolute top-0.5 ${
            value ? 'bg-jarvis-cyan' : 'bg-jarvis-muted'
          }`}
        />
      </button>
    </div>
  )
}

function SettingRange({ label, value, min, max, step, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-mono text-jarvis-text">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-32 accent-cyan-400"
        />
        <span className="text-xs font-mono text-jarvis-muted w-8">{value}</span>
      </div>
    </div>
  )
}
