const express = require('express')
const router = express.Router()
const axios = require('axios')

router.post('/search', async (req, res) => {
  const { query } = req.body
  if (!query) return res.status(400).json({ error: 'Query required' })

  const apiKey = process.env.SEARCHAPI_KEY
  if (!apiKey) {
    return res.json({
      response: `Search API not configured. Add SEARCHAPI_KEY to your .env file. You can get one at https://www.searchapi.io`,
      type: 'error',
    })
  }

  try {
    const response = await axios.get('https://www.searchapi.io/api/v1/search', {
      params: {
        engine: 'google',
        q: query,
        api_key: apiKey,
      },
    })

    const results = (response.data.organic_results || []).slice(0, 5)
    if (results.length === 0) {
      return res.json({ response: `No results found for "${query}".`, type: 'search' })
    }

    const formatted = results
      .map((r, i) => `${i + 1}. ${r.title}\n   ${r.link}\n   ${r.snippet || ''}`)
      .join('\n\n')

    res.json({ response: `Search results for "${query}":\n\n${formatted}`, type: 'search' })
  } catch (err) {
    res.json({ response: `Search failed: ${err.message}`, type: 'error' })
  }
})

module.exports = router
