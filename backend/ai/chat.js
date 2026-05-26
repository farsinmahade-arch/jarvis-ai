const OpenAI = require('openai')

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const SYSTEM_PROMPT = `You are JARVIS — Just A Rather Very Intelligent System.
You are an advanced AI assistant inspired by Tony Stark's JARVIS from the Iron Man universe.

Personality:
- Intelligent, calm, efficient, and concise
- Professional yet personable, with subtle wit
- Address the user respectfully
- Speak naturally but with precision

Capabilities:
- Answer questions on any topic with depth and accuracy
- Help manage tasks and provide recommendations
- Analyze information and provide insights
- Assist with coding, writing, and problem-solving
- Search the web when asked (results will be provided in context)
- Control desktop applications when asked
- Remember user preferences and facts

Guidelines:
- Keep responses focused and avoid unnecessary verbosity
- Use markdown formatting for code, lists, and structured content
- If web search results are provided, incorporate them naturally
- If user facts/preferences are provided, personalize your responses`

async function askJarvis(message, history = [], searchResults = null, memoryContext = null) {
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }]

  // Add memory context
  if (memoryContext) {
    messages.push({
      role: 'system',
      content: `User context: ${memoryContext}`
    })
  }

  // Add search results
  if (searchResults) {
    const snippets = searchResults.organic_results
      ?.slice(0, 3)
      .map(r => `- ${r.title}: ${r.snippet}`)
      .join('\n')

    if (snippets) {
      messages.push({
        role: 'system',
        content: `Web search results for context:\n${snippets}`
      })
    }
  }

  // Add conversation history (last 10 exchanges)
  if (history && history.length > 0) {
    history.slice(-10).forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content })
      }
    })
  }

  // Add current message
  messages.push({ role: 'user', content: message })

  const settings = require('../memory/memory').getSettings()
  const model = settings.ai_model || 'gpt-4.1-mini'

  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    max_tokens: 1024,
  })

  return response.choices[0].message.content
}

module.exports = askJarvis
