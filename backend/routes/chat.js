const express = require('express')
const router = express.Router()
const chatController = require('../controllers/chatController')
const auth = require('../middleware/auth')

// Get chat history for a property
router.get('/:propertyId', auth, chatController.getChat)

// Send a message
router.post('/:propertyId', auth, chatController.sendMessage)

module.exports = router 