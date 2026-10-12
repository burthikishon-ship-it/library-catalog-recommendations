const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const User = require('../models/User');

// @desc    Borrow an available book
// @route   POST /api/borrows
// @access  Private
const borrowBook = async (req, res, next) => {
  try {
    const { bookId, durationDays = 14 } = req.body;
    const userId = req.user._id;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide bookId to borrow',
      });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    // 1. Check availability
    if (book.availableCopies <= 0 || !book.availability) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, this book is currently out of stock / unavailable',
      });
    }

    // 2. Check if user currently has an active unreturned loan for this exact book
    const existingActiveBorrow = await Borrow.findOne({
      user: userId,
      book: bookId,
      status: 'borrowed',
    });

    if (existingActiveBorrow) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active loan for this book. Please return it before borrowing again.',
      });
    }

    // 3. Calculate due date (default: 14 days)
    const borrowDate = new Date();
    const days = Math.min(30, Math.max(7, Number(durationDays) || 14));
    const dueDate = new Date(borrowDate.getTime() + days * 24 * 60 * 60 * 1000);

    // 4. Create Borrow Record
    const borrow = await Borrow.create({
      user: userId,
      book: bookId,
      borrowDate,
      dueDate,
      status: 'borrowed',
    });

    // 5. Decrement book available copies & increment borrow count
    book.availableCopies = Math.max(0, book.availableCopies - 1);
    book.availability = book.availableCopies > 0;
    book.borrowCount = (book.borrowCount || 0) + 1;
    await book.save();

    const populatedBorrow = await Borrow.findById(borrow._id)
      .populate('book', 'title author coverImage genre ISBN')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: `Successfully borrowed "${book.title}". Due date is ${dueDate.toLocaleDateString()}.`,
      borrow: populatedBorrow,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Return a borrowed book
// @route   PUT /api/borrows/:id/return
// @access  Private
const returnBook = async (req, res, next) => {
  try {
    const borrowId = req.params.id;
    const borrow = await Borrow.findById(borrowId);

    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: 'Borrow record not found',
      });
    }

    // Ensure only the borrower or an admin can return
    const isOwner = String(borrow.user._id || borrow.user) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to return this loan record',
      });
    }

    if (borrow.status === 'returned') {
      return res.status(400).json({
        success: false,
        message: 'This book has already been marked as returned',
      });
    }

    const returnDate = new Date();
    const isOverdue = returnDate > new Date(borrow.dueDate);
    let fine = 0;

    if (isOverdue) {
      const diffTime = Math.abs(returnDate - new Date(borrow.dueDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine = diffDays * 1.5; // $1.50 per day overdue
    }

    borrow.status = 'returned';
    borrow.returnDate = returnDate;
    borrow.fine = fine;
    await borrow.save();

    // Increment book available copies
    const bookId = borrow.book._id || borrow.book;
    const book = await Book.findById(bookId);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, (book.availableCopies || 0) + 1);
      book.availability = book.availableCopies > 0;
      await book.save();
    }

    const updatedBorrow = await Borrow.findById(borrowId)
      .populate('book', 'title author coverImage genre')
      .populate('user', 'name email');

    res.status(200).json({
      success: true,
      message: `Book returned successfully.${fine > 0 ? ` Note: Overdue fee calculated: $${fine.toFixed(2)}` : ''}`,
      borrow: updatedBorrow,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user's borrowings (active and past history)
// @route   GET /api/borrows/my
// @access  Private
const getMyBorrows = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const borrows = await Borrow.find(filter)
      .populate('book', 'title author coverImage genre averageRating ISBN')
      .sort({ createdAt: -1 });

    const activeBorrows = borrows.filter(b => b.status === 'borrowed');
    const returnedBorrows = borrows.filter(b => b.status === 'returned');

    res.status(200).json({
      success: true,
      totalCount: borrows.length,
      activeCount: activeBorrows.length,
      returnedCount: returnedBorrows.length,
      borrows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all borrowing records (Admin only)
// @route   GET /api/borrows
// @access  Private/Admin
const getAllBorrows = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const totalRecords = await Borrow.countDocuments(filter);
    const borrows = await Borrow.find(filter)
      .populate('book', 'title author coverImage genre ISBN')
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limitNum) || 1,
      currentPage: pageNum,
      borrows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  borrowBook,
  returnBook,
  getMyBorrows,
  getAllBorrows,
};
