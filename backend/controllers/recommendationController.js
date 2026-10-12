const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const Review = require('../models/Review');
const User = require('../models/User');
const RecommendationEngine = require('../services/recommendationEngine');

// @desc    Get personalized book recommendations for authenticated or guest user
// @route   GET /api/recommendations
// @access  Public (Optional Auth)
const getRecommendations = async (req, res, next) => {
  try {
    const { limit = 8 } = req.query;
    const allBooks = await Book.find({});

    let borrowHistory = [];
    let userReviews = [];
    let userDoc = null;

    if (req.user) {
      userDoc = await User.findById(req.user._id);
      borrowHistory = await Borrow.find({ user: req.user._id });
      userReviews = await Review.find({ user: req.user._id });
    }

    const recommendations = RecommendationEngine.generateUserRecommendations({
      user: userDoc,
      allBooks,
      borrowHistory,
      userReviews,
      limit: parseInt(limit, 10) || 8,
    });

    res.status(200).json({
      success: true,
      count: recommendations.length,
      isPersonalized: !!userDoc,
      favoriteGenres: userDoc ? userDoc.favoriteGenres : [],
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get books similar to a specific book (Content-based TF-IDF + Genre + Author)
// @route   GET /api/recommendations/similar/:bookId
// @access  Public
const getSimilarBooks = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { limit = 5 } = req.query;

    const targetBook = await Book.findById(bookId);
    if (!targetBook) {
      return res.status(404).json({
        success: false,
        message: 'Target book not found',
      });
    }

    const allBooks = await Book.find({});
    const similarBooks = RecommendationEngine.getSimilarBooks(
      targetBook,
      allBooks,
      parseInt(limit, 10) || 5
    );

    res.status(200).json({
      success: true,
      targetBookTitle: targetBook.title,
      count: similarBooks.length,
      similarBooks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommendations categorized by user's favorite genres
// @route   GET /api/recommendations/by-genre
// @access  Private
const getRecommendationsByGenre = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const genres = user?.favoriteGenres || ['Science Fiction', 'Fiction', 'Technology'];

    const categorized = {};
    for (const g of genres) {
      const booksInGenre = await Book.find({
        genre: { $in: [g] },
      })
        .sort({ averageRating: -1 })
        .limit(6);

      categorized[g] = booksInGenre;
    }

    res.status(200).json({
      success: true,
      genres,
      categorized,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
  getSimilarBooks,
  getRecommendationsByGenre,
};
