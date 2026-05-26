/**
 * Speech-to-Text module
 * Supports: Browser SpeechRecognition (default), Deepgram (API key required)
 *
 * Browser STT is handled client-side. This module handles Deepgram.
 */

const axios = require('axios')

async function transcribeAudio(audioBuffer, provider = 'browser') {
  if (provider === 'deepgram') {
    return transcribeDeepgram(audioBuffer)
  }
  // Browser STT is handled on the frontend
  return { provider: 'browser' }
}

async function transcribeDeepgram(audioBuffer) {
  if (!process.env.DEEPGRAM_API_KEY) {
    throw new Error('Deepgram API key not configured')
  }

  const response = await axios.post(
    'https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true',
    audioBuffer,
    {
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/wav'
      }
    }
  )

  const transcript = response.data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
  return {
    provider: 'deepgram',
    transcript,
    confidence: response.data?.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0
  }
}

module.exports = { transcribeAudio }
