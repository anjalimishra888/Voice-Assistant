const Chat = require('../models/Chat');
const { getAIResponse, detectAction } = require('../services/aiService');

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Check for action commands (open app/site)
    const action = detectAction(message);
    
    // Get AI response
    const aiResponse = await getAIResponse(message);

    // Save chat to database
    const chat = await Chat.create({
      userId: req.user._id,
      userMessage: message,
      aiResponse,
    });

    res.json({
      _id: chat._id,
      userMessage: chat.userMessage,
      aiResponse: chat.aiResponse,
      timestamp: chat.timestamp,
      action: action || null,
    });
  } catch (error) {
    console.error('Chat Controller Error:', error);
    res.status(500).json({ message: 'Failed to get response. Please try again.' });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50);
    
    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
};

const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (chat.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Chat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete chat' });
  }
};

const clearAllChats = async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.user._id });
    res.json({ message: 'All chats cleared successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to clear chats' });
  }
};

module.exports = { sendMessage, getChatHistory, deleteChat, clearAllChats };