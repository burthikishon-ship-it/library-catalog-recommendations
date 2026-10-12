const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  getSimilarBooks,
  getRecommendationsByGenre,
} = require('../controllers/recommendationController');
const { optionalAuth, protect } = require('../middleware/authMiddleware');

router.get('/', optionalAuth, getRecommendations);
router.get('/similar/:bookId', getSimilarBooks);
router.get('/by-genre', protect, getRecommendationsByGenre);

module.exports = router;
