const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userMessage: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
  },
  aiResponse: {
    type: String,
    required: [true, 'Response is required'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Chat', chatSchema);