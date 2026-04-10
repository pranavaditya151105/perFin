const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { getCurrentUser } = require('../utils/auth');

router.post('/upload', getCurrentUser, uploadController.uploadMiddleware, uploadController.uploadFile);

module.exports = router;
