const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getGenres,
  getFeaturedBooks,
} = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/genres', getGenres);
router.get('/featured', getFeaturedBooks);
router.get('/', getBooks);
router.get('/:id', getBookById);

// Admin-only routes
router.post('/', protect, adminOnly, createBook);
router.put('/:id', protect, adminOnly, updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

module.exports = router;
