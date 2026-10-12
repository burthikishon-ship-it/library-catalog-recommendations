const Book = require('../models/Book');
const Review = require('../models/Review');
const Borrow = require('../models/Borrow');
const RecommendationEngine = require('../services/recommendationEngine');

// @desc    Get all books with search, filter, sort, and pagination
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res, next) => {
  try {
    const {
      search,
      genre,
      author,
      minRating,
      publicationYear,
      availability,
      sort = 'popularity',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // 1. Keyword Search across Title, Author, ISBN, Description, Tags
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { author: { $regex: search.trim(), $options: 'i' } },
        { ISBN: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { genre: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // 2. Genre Filter
    if (genre && genre !== 'All') {
      query.genre = { $in: [genre] };
    }

    // 3. Author Filter
    if (author && author.trim()) {
      query.author = { $regex: author.trim(), $options: 'i' };
    }

    // 4. Rating Filter
    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // 5. Publication Year Filter
    if (publicationYear) {
      query.publicationYear = { $gte: Number(publicationYear) };
    }

    // 6. Availability Filter
    if (availability === 'true' || availability === true) {
      query.availableCopies = { $gt: 0 };
    }

    // Sorting
    let sortOption = {};
    if (sort === 'title_asc') sortOption = { title: 1 };
    else if (sort === 'title_desc') sortOption = { title: -1 };
    else if (sort === 'rating') sortOption = { averageRating: -1 };
    else if (sort === 'newest') sortOption = { publicationYear: -1 };
    else if (sort === 'oldest') sortOption = { publicationYear: 1 };
    else if (sort === 'popularity') sortOption = { borrowCount: -1 };
    else sortOption = { createdAt: -1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const totalBooks = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: books.length,
      totalBooks,
      totalPages: Math.ceil(totalBooks / limitNum) || 1,
      currentPage: pageNum,
      books,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book by ID with detailed info
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    // Fetch recent reviews for this book
    const reviews = await Review.find({ book: book._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      book,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new book (Admin only)
// @route   POST /api/books
// @access  Private/Admin
const createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      ISBN,
      genre,
      description,
      publicationYear,
      publisher,
      coverImage,
      totalCopies,
      tags,
      pageCount,
      language,
    } = req.body;

    if (!title || !author || !ISBN || !genre || !description || !publicationYear) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, author, ISBN, genre, description, publicationYear',
      });
    }

    // Check if ISBN already exists
    const existing = await Book.findOne({ ISBN: ISBN.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A book with this ISBN already exists',
      });
    }

    const copies = Number(totalCopies) || 5;

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      ISBN: ISBN.trim(),
      genre: Array.isArray(genre) ? genre : genre.split(',').map(g => g.trim()),
      description,
      publicationYear: Number(publicationYear),
      publisher: publisher || 'Independent Publisher',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
      totalCopies: copies,
      availableCopies: copies,
      availability: copies > 0,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      pageCount: Number(pageCount) || 300,
      language: language || 'English',
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      book,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book details (Admin only)
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    const updates = { ...req.body };
    if (updates.genre && typeof updates.genre === 'string') {
      updates.genre = updates.genre.split(',').map(g => g.trim());
    }
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(t => t.trim());
    }

    if (updates.totalCopies !== undefined) {
      const diff = Number(updates.totalCopies) - book.totalCopies;
      updates.availableCopies = Math.max(0, (book.availableCopies || 0) + diff);
      updates.availability = updates.availableCopies > 0;
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      book: updatedBook,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a book (Admin only)
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    // Check if book has active borrowings
    const activeBorrows = await Borrow.countDocuments({
      book: book._id,
      status: 'borrowed',
    });

    if (activeBorrows > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete book: ${activeBorrows} copies are currently borrowed by readers. Wait for returns first.`,
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Book removed from catalog',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all distinct genres in catalog
// @route   GET /api/books/genres
// @access  Public
const getGenres = async (req, res, next) => {
  try {
    const genres = await Book.distinct('genre');
    res.status(200).json({
      success: true,
      genres: genres.filter(Boolean).sort(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular / featured books
// @route   GET /api/books/featured
// @access  Public
const getFeaturedBooks = async (req, res, next) => {
  try {
    const featured = await Book.find({ featured: true }).limit(8);
    const popular = await Book.find({}).sort({ borrowCount: -1 }).limit(8);

    res.status(200).json({
      success: true,
      featured,
      popular,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getGenres,
  getFeaturedBooks,
};
