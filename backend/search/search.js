const axios = require('axios')

async function searchInternet(query) {
  if (!process.env.SEARCHAPI_KEY) {
    throw new Error('SearchAPI key not configured')
  }

  const response = await axios.get('https://www.searchapi.io/api/v1/search', {
    params: {
      engine: 'google',
      q: query,
      api_key: process.env.SEARCHAPI_KEY
    },
    timeout: 10000
  })

  return response.data
}

module.exports = searchInternet
