const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const Review = require('../models/Review');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const booksData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'booksData.json'), 'utf-8')
);

const seedUsers = [
  {
    name: 'Lovely Kishon',
    email: 'lovelykishon@gmail.com',
    password: '8341428657',
    role: 'admin',
    favoriteGenres: ['Programming', 'Technology', 'Computer Science', 'Engineering'],
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    bio: 'Lead Architect & Library Administrator.',
  },
];

const sampleReviews = [
  {
    bookTitle: 'Let Us C',
    userEmail: 'lovelykishon@gmail.com',
    rating: 5,
    title: 'Cleared all my pointer concepts in 1st year!',
    comment: 'Yashavant Kanetkar\'s explanations and end-of-chapter exercises are legendary. Must-read for every engineering student preparing for lab exams.',
  },
  {
    bookTitle: 'Database System Concepts',
    userEmail: 'lovelykishon@gmail.com',
    rating: 5,
    title: 'Gold standard for DBMS coursework',
    comment: 'The chapters on SQL, BCNF normalization, and ACID transaction isolation are crystal clear. Invaluable for semester exams and GATE.',
  },
  {
    bookTitle: 'Higher Engineering Mathematics',
    userEmail: 'lovelykishon@gmail.com',
    rating: 5,
    title: 'The B.Tech engineering math bible',
    comment: 'B.S. Grewal is the most essential book in the college library. Covered all our differential equations and Laplace transform problems perfectly.',
  },
  {
    bookTitle: 'Operating System Concepts',
    userEmail: 'lovelykishon@gmail.com',
    rating: 5,
    title: 'Timeless Dinosaur Book',
    comment: 'CPU scheduling, semaphores, and virtual memory paging explained with unmatched depth. Essential for systems engineering.',
  },
  {
    bookTitle: 'Dune',
    userEmail: 'lovelykishon@gmail.com',
    rating: 5,
    title: 'A towering sci-fi masterpiece',
    comment: 'The world-building on Arrakis is unmatched. Frank Herbert created a layered socio-political and ecological epic that resonates more with every re-read.',
  },
  {
    bookTitle: 'Project Hail Mary',
    userEmail: 'lovelykishon@gmail.com',
    rating: 5,
    title: 'Could not put it down!',
    comment: 'Andy Weir strikes gold again. Ryland and Rocky have the best dynamic in modern speculative fiction. Hilarious, smart, and uplifting science.',
  },
  {
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    userEmail: 'lovelykishon@gmail.com',
    rating: 4,
    title: 'Essential fundamentals for developers',
    comment: 'Solid foundational principles on functions, naming, and structure. Some Java specifics are aged, but the overarching mindset is timeless.',
  },
  {
    bookTitle: '1984',
    userEmail: 'lovelykishon@gmail.com',
    rating: 5,
    title: 'Hauntingly prophetic',
    comment: 'Orwell’s vision of psychological control and linguistic erosion through Newspeak is chillingly relevant. A vital read for every generation.',
  },
  {
    bookTitle: 'Atomic Habits',
    userEmail: 'lovelykishon@gmail.com',
    rating: 5,
    title: 'Actionable and transformative',
    comment: 'Clear, concise frameworks on habit stacking and environmental design. Genuinely shifted how I organize my daily reading and study habits.',
  },
  {
    bookTitle: 'Meditations',
    userEmail: 'lovelykishon@gmail.com',
    rating: 5,
    title: 'Timeless guidance for inner calm',
    comment: 'The journal of an emperor grappling with duty, humility, and mortality. Reading one page a day brings extraordinary perspective.',
  },
];

const runSeed = async () => {
  try {
    console.log('[Seed] Starting database seed...');
    await connectDB();

    // 1. Seed Users
    const createdUsers = [];
    for (const u of seedUsers) {
      const existing = await User.findOne({ email: u.email });
      if (!existing) {
        const user = await User.create(u);
        createdUsers.push(user);
        console.log(`[Seed] Created User: ${u.email} (${u.role})`);
      } else {
        createdUsers.push(existing);
        console.log(`[Seed] User already exists: ${u.email}`);
      }
    }

    // 2. Seed Books
    const createdBooks = [];
    for (const b of booksData) {
      const existing = await Book.findOne({ ISBN: b.ISBN });
      if (!existing) {
        const book = await Book.create(b);
        createdBooks.push(book);
      } else {
        createdBooks.push(existing);
      }
    }
    console.log(`[Seed] Seeded ${createdBooks.length} books in catalog.`);

    // 3. Seed Sample Borrows
    const lovelyUser = createdUsers.find(u => u.email === 'lovelykishon@gmail.com');
    const duneBook = createdBooks.find(b => b.title === 'Dune');
    const cleanCodeBook = createdBooks.find(b => b.title.includes('Clean Code'));
    const letUsCBook = createdBooks.find(b => b.title === 'Let Us C');

    if (lovelyUser && duneBook) {
      const existingBorrow = await Borrow.findOne({ user: lovelyUser._id, book: duneBook._id });
      if (!existingBorrow) {
        await Borrow.create({
          user: lovelyUser._id,
          book: duneBook._id,
          borrowDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
          status: 'borrowed',
        });
        console.log('[Seed] Created active borrow for Lovely Kishon (Dune)');
      }
    }

    if (lovelyUser && cleanCodeBook) {
      const existingBorrow = await Borrow.findOne({ user: lovelyUser._id, book: cleanCodeBook._id });
      if (!existingBorrow) {
        await Borrow.create({
          user: lovelyUser._id,
          book: cleanCodeBook._id,
          borrowDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
          returnDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          status: 'returned',
        });
        console.log('[Seed] Created returned borrow for Lovely Kishon (Clean Code)');
      }
    }

    if (lovelyUser && letUsCBook) {
      const existingBorrow = await Borrow.findOne({ user: lovelyUser._id, book: letUsCBook._id });
      if (!existingBorrow) {
        await Borrow.create({
          user: lovelyUser._id,
          book: letUsCBook._id,
          borrowDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
          status: 'borrowed',
        });
        console.log('[Seed] Created active borrow for Lovely Kishon (Let Us C)');
      }
    }

    // 4. Seed Reviews
    for (const rev of sampleReviews) {
      const targetBook = createdBooks.find(b => b.title === rev.bookTitle);
      const targetUser = createdUsers.find(u => u.email === rev.userEmail);

      if (targetBook && targetUser) {
        const existingReview = await Review.findOne({
          user: targetUser._id,
          book: targetBook._id,
        });

        if (!existingReview) {
          await Review.create({
            user: targetUser._id,
            book: targetBook._id,
            rating: rev.rating,
            title: rev.title,
            comment: rev.comment,
            likes: Math.floor(Math.random() * 12) + 1,
          });
          console.log(`[Seed] Created review for "${targetBook.title}" by ${targetUser.name}`);
        }
      }
    }

    console.log('[Seed] Database seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('  Admin User : lovelykishon@gmail.com / 8341428657 (Lovely Kishon)');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
  }
};

const autoSeedIfEmpty = async () => {
  const count = await Book.countDocuments();
  if (count === 0) {
    console.log('[Seed] Catalog is empty. Automatically initializing sample library dataset...');
    await runSeed();
  }
};

// If run directly via command line: `node seed/seed.js`
if (require.main === module) {
  runSeed().then(() => process.exit(0));
}

module.exports = { runSeed, autoSeedIfEmpty };
