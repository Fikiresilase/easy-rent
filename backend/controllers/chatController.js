const Chat = require('../models/Chat')
const Property = require('../models/Property')

// Get or create chat for a property
exports.getChat = async (req, res) => {
  try {
    const { propertyId } = req.params
    const userId = req.user._id

    // Check if property exists
    const property = await Property.findById(propertyId)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }

    // Find existing chat or create new one
    let chat = await Chat.findOne({ property: propertyId })
      .populate('messages.sender', 'name')
      .populate('participants', 'name')

    if (!chat) {
      chat = await Chat.create({
        property: propertyId,
        participants: [userId, property.owner],
        messages: []
      })
    }

    res.json(chat)
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ message: 'Error accessing chat' })
  }
}

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { propertyId } = req.params
    const { message } = req.body
    const userId = req.user._id

    // Find chat
    let chat = await Chat.findOne({ property: propertyId })
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' })
    }

    // Add message
    const newMessage = {
      sender: userId,
      content: message
    }

    chat.messages.push(newMessage)
    await chat.save()

    // Return the new message with sender details
    const populatedChat = await Chat.findById(chat._id)
      .populate('messages.sender', 'name')
      .populate('participants', 'name')

    const sentMessage = populatedChat.messages[populatedChat.messages.length - 1]
    res.json(sentMessage)
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ message: 'Error sending message' })
  }
} 