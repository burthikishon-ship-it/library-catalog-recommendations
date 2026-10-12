const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');
const Review = require('../models/Review');
const { getDbStatus } = require('../config/db');

// @desc    Get Admin Dashboard KPI metrics and stats
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalBooks = await Book.countDocuments();
    const allBooks = await Book.find({});

    const totalCopies = allBooks.reduce((sum, b) => sum + (b.totalCopies || 0), 0);
    const availableCopies = allBooks.reduce((sum, b) => sum + (b.availableCopies || 0), 0);
    const borrowedCopies = totalCopies - availableCopies;

    const totalUsers = await User.countDocuments();
    const activeLoans = await Borrow.countDocuments({ status: 'borrowed' });
    const totalBorrows = await Borrow.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Most popular books
    const popularBooks = await Book.find({})
      .sort({ borrowCount: -1 })
      .limit(5);

    // Recent activity (latest loans)
    const recentActivity = await Borrow.find({})
      .populate('user', 'name email avatar')
      .populate('book', 'title author coverImage genre')
      .sort({ createdAt: -1 })
      .limit(8);

    // Genre distribution
    const genreCounts = {};
    allBooks.forEach(b => {
      if (b.genre) {
        b.genre.forEach(g => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalBooks,
        totalCopies,
        availableCopies,
        borrowedCopies,
        activeLoans,
        totalUsers,
        totalBorrows,
        totalReviews,
      },
      popularBooks,
      recentActivity,
      genreDistribution: genreCounts,
      systemInfo: getDbStatus(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (e.g. promote to admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role provided. Must be "user" or "admin".',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
};
