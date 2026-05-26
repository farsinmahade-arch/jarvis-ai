const express = require('express')
const router = express.Router()
const { loadMemory, saveMemory } = require('./memory-store')

router.get('/memory', (req, res) => {
  const memory = loadMemory()
  res.json(memory)
})

router.post('/memory/preferences', (req, res) => {
  const memory = loadMemory()
  memory.preferences = { ...memory.preferences, ...req.body }
  saveMemory(memory)
  res.json({ success: true })
})

module.exports = router
