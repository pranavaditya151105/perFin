const express = require('express');
const router = express.Router();
const analyzeController = require('../controllers/analyzeController');
const { getCurrentUser } = require('../utils/auth');

router.post('/analyze', getCurrentUser, analyzeController.analyzeProfile);
router.get('/analyze/me', getCurrentUser, analyzeController.getMyAnalysis);
router.get('/analyze/profile/me', getCurrentUser, analyzeController.getMyProfile);
router.delete('/analyze/me', getCurrentUser, analyzeController.deleteAccount);
router.get('/analyze/export', getCurrentUser, analyzeController.exportAnalysis);

module.exports = router;
