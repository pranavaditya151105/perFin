const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { getCurrentUser } = require('../utils/auth');

router.post('/chat', getCurrentUser, chatController.sendMessage);
router.get('/chat/history', getCurrentUser, chatController.getConversations);
router.get('/chat/history/:id', getCurrentUser, chatController.getThreadMessages);
router.delete('/chat/history/:id', getCurrentUser, chatController.deleteConversation);

module.exports = router;
