const Review = require('../models/Review');
const Book = require('../models/Book');

// Helper to recalculate and update book's averageRating and ratingsCount
async function updateBookRatingStats(bookId) {
  const reviews = await Review.find({ book: bookId });
  const ratingsCount = reviews.length;
  let averageRating = 0;

  if (ratingsCount > 0) {
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    averageRating = Math.round((sum / ratingsCount) * 10) / 10;
  }

  const book = await Book.findById(bookId);
  if (book) {
    book.averageRating = averageRating;
    book.ratingsCount = ratingsCount;
    await book.save();
  }
}

// @desc    Add or update a book review & rating
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res, next) => {
  try {
    const { bookId, rating, title, comment } = req.body;
    const userId = req.user._id;

    if (!bookId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookId, a 1-5 star rating, and review comment',
      });
    }

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars',
      });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    // Check if user already reviewed this book
    let review = await Review.findOne({ user: userId, book: bookId });

    if (review) {
      // Update existing review
      review.rating = numericRating;
      review.title = title || '';
      review.comment = comment;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        user: userId,
        book: bookId,
        rating: numericRating,
        title: title || '',
        comment,
      });
    }

    // Recalculate book average rating
    await updateBookRatingStats(bookId);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name avatar')
      .populate('book', 'title author');

    res.status(201).json({
      success: true,
      message: 'Review saved successfully',
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a specific book
// @route   GET /api/reviews/book/:bookId
// @access  Public
const getBookReviews = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const reviews = await Review.find({ book: bookId })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const isOwner = String(review.user._id || review.user) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    const bookId = review.book._id || review.book;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate ratings
    await updateBookRatingStats(bookId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getBookReviews,
  deleteReview,
};
