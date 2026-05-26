/**
 * Text-to-Speech module
 * Supports: Browser SpeechSynthesis (default), ElevenLabs (API key required)
 *
 * Browser TTS is handled client-side. This module handles ElevenLabs.
 */

const axios = require('axios')

async function synthesizeSpeech(text, provider = 'browser') {
  if (provider === 'elevenlabs') {
    return synthesizeElevenLabs(text)
  }
  // Browser TTS is handled on the frontend
  return { provider: 'browser', text }
}

async function synthesizeElevenLabs(text) {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured')
  }

  const voiceId = 'pNInz6obpgDQGcFmaJgB' // "Adam" voice

  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    },
    {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      responseType: 'arraybuffer'
    }
  )

  return {
    provider: 'elevenlabs',
    audio: Buffer.from(response.data).toString('base64'),
    contentType: 'audio/mpeg'
  }
}

module.exports = { synthesizeSpeech }
