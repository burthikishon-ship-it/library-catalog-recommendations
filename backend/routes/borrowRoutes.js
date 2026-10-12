const express = require('express');
const router = express.Router();
const {
  borrowBook,
  returnBook,
  getMyBorrows,
  getAllBorrows,
} = require('../controllers/borrowController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.post('/', protect, borrowBook);
router.put('/:id/return', protect, returnBook);
router.get('/my', protect, getMyBorrows);
router.get('/', protect, adminOnly, getAllBorrows);

module.exports = router;
