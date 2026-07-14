const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, deleteChat, clearAllChats } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.post('/message', protect, sendMessage);
router.get('/history', protect, getChatHistory);
router.delete('/:id', protect, deleteChat);
router.delete('/', protect, clearAllChats);

module.exports = router;