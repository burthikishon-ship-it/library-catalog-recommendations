# 📚 KIET Central Library | Smart Catalog & AI Book Recommendation System

> **Institution**: Kakinada Institute of Engineering & Technology (KIET), Kakinada  
> **Project Lead / Architect**: Lovely Kishon  
> **Course / Project**: Academic Full-Stack Web Development & Machine Learning Project  

A full-stack, production-grade web application for library catalog management, digital book lending, community reviews, and content-based book recommendations powered by machine learning algorithms.

---

## ✨ Features Overview

### 1. 🔐 User Authentication & Role-Based Authorization
- **JWT-Based Authentication**: Secure stateless token issuance and verification.
- **Password Security**: Salted hashing with `bcryptjs` (10 rounds).
- **Role-Based Access Control**:
  - `user` (Reader): Browse, search, borrow available books, return active loans, write reviews, and receive personalized recommendations.
  - `admin` (Chief Librarian): Comprehensive catalog CRUD (create, update, delete books), inventory stock management, view all active/returned loans, and oversee registered users.
- **One-Click Demo Accounts**: Pre-configured logins on the sign-in page for instant evaluation.

### 2. 📖 Library Catalog & Real-Time Discovery
- **Comprehensive Metadata**: Title, Author, ISBN, Genres, Full Synopsis, Publication Year, Publisher, Cover Image, Available Copies, Total Copies, Page Count, and Star Ratings.
- **Live Search Autocomplete**: Instant debounced search dropdown across titles, authors, keywords, and ISBNs.
- **Multi-Faceted Filtering**: Filter by genre, author, publication year, minimum rating (e.g. 4.5+), and availability ("In Stock Only").
- **Dynamic Sorting**: Sort by popularity (total loans), highest rated, publication date (newest/oldest), or title (A–Z / Z–A).

### 3. 🧠 Smart Recommendation Engine
- **Content-Based Filtering**:
  - **TF-IDF & Cosine Similarity**: Analyzes book descriptions, titles, and thematic keyword tags.
  - **Genre Jaccard Affinity**: Calculates intersection-over-union similarity between book genres.
  - **Author Affinity**: Measures author overlap and literary style affinity.
  - **Quality & Popularity Weighting**: Factored with community ratings and borrow frequencies.
- **User Preference Personalization**:
  - Weights reader's declared favorite genres.
  - Weights previous borrow history.
  - Incorporates past star ratings (high ratings boost similar items; low ratings penalize).
  - Filters or discounts currently checked-out titles to keep suggestions fresh.
- **Explainable Recommendations**: Every recommended book displays a match percentage (e.g. `96% Match`) and transparent reason (e.g. *"Because you enjoy Science Fiction"*, *"Another acclaimed title by Andy Weir"*).
- **"Readers Also Enjoyed"**: Computes pairwise book similarity directly on individual book detail pages.

### 4. 🔄 Book Borrowing & Return System
- **Checkout Flow**: 1-click borrow with custom loan period selection (7, 14, or 21 days).
- **Due Date Tracking**: Dynamic calculation and countdown badges (e.g., *"Due in 11 days"* or *"Overdue"*).
- **Availability Enforcement**: Prevents borrowing out-of-stock titles and blocks duplicate simultaneous loans of the same book.
- **Self-Service Returns**: Readers can return books directly from their dashboard.

### 5. ⭐ Book Ratings & Reviews
- **Interactive 1–5 Star Rating**: Readers can submit detailed reviews with headlines and comments.
- **Automatic Stat Recalculation**: Live recalculation of the book's `averageRating` and `ratingsCount` upon review submission.
- **Review Moderation**: Reviews can be deleted by their author or system administrators.

### 6. 📊 Dedicated Dashboards
- **User Dashboard**:
  - Metric summary cards (Active Loans, Completed Reads, Recommendations).
  - Active Borrowed Books list with live Due Date countdown and return button.
  - Complete reading history archive.
  - Reading interest / favorite genres manager.
- **Admin Dashboard**:
  - Telemetry KPIs: Total Titles, Available Copies, Active Checked-Out Books, Registered Users.
  - Inventory Management: Searchable table with Add Book modal, Edit Book modal, Delete Book, and stock adjustments.
  - Borrowing Activity Log: Complete audit log of all patron loans filterable by status.
  - User Directory: Manage registered accounts with promote/demote role privileges.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite | Reactive, modular component architecture |
| **Styling** | Vanilla CSS, Tailwind CSS | Sleek glassmorphism, responsive grid, dark mode |
| **Icons & Fonts** | Lucide React, Google Fonts | Plus Jakarta Sans, Playfair Display, vector icons |
| **Backend** | Node.js, Express.js | Modular RESTful API and controller architecture |
| **Database** | MongoDB / Mongoose | Robust document modeling, validation, and indexes |
| **Embedded DB** | Dual-Engine Store Adapter | Zero-configuration local JSON engine when MongoDB is offline |
| **Security** | JWT, bcryptjs, CORS | Secure tokens, salted hashing, and sanitized requests |
| **Algorithm** | TF-IDF, Cosine Similarity | Content-based recommendation and vectorization |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher) & npm (v9.0.0 or higher)
- *(Optional)* MongoDB instance running locally on port `27017` or MongoDB Atlas URI. If MongoDB is not active, the system automatically runs the high-performance **Embedded Engine** with zero setup required!

### 1. Clone or Open Project
```bash
cd "f:/Desktop/library catalog"
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies (already installed)
npm install

# (Optional) Seed the database with 24+ books, sample users, and reviews
npm run seed

# Start the backend server
npm run dev
# The API will start on http://localhost:5000
```

### 3. Frontend Setup
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies (already installed)
npm install

# Start the Vite development server
npm run dev
# The web app will launch on http://localhost:5173
```

---

## 🔑 Demo Login Credentials

The application comes pre-loaded with realistic demo accounts. You can also use the **Instant 1-Click Autofill** buttons on the `/login` page:

| Role | Email | Password | Interests / Persona |
| :--- | :--- | :--- | :--- |
| **Admin** | `lovelykishon@gmail.com` | `8341428657` | **Lovely Kishon** (Administrator & Lead Architect) |

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new reader account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated profile *(Private)*
- `PUT /api/auth/profile` — Update name, bio, and favorite genres *(Private)*
- `PUT /api/auth/change-password` — Change password *(Private)*

### Books Catalog (`/api/books`)
- `GET /api/books` — Query catalog with search, genre, rating, availability, sort, and pagination
- `GET /api/books/:id` — Get detailed book synopsis, availability, and community reviews
- `GET /api/books/genres` — List distinct genres in catalog
- `GET /api/books/featured` — Get featured and popular titles
- `POST /api/books` — Create a new book *(Admin Only)*
- `PUT /api/books/:id` — Update book metadata or copies *(Admin Only)*
- `DELETE /api/books/:id` — Remove book from catalog *(Admin Only)*

### Loans & Borrowing (`/api/borrows`)
- `POST /api/borrows` — Borrow an available book *(Private)*
- `PUT /api/borrows/:id/return` — Return an active loan *(Private)*
- `GET /api/borrows/my` — Get logged-in user's active loans and history *(Private)*
- `GET /api/borrows` — List all borrowing audit logs with status filter *(Admin Only)*

### Reviews & Ratings (`/api/reviews`)
- `POST /api/reviews` — Post 1–5 star rating and review comment *(Private)*
- `GET /api/reviews/book/:bookId` — Get all reviews for a book
- `DELETE /api/reviews/:id` — Delete a review *(Private)*

### Recommendations (`/api/recommendations`)
- `GET /api/recommendations` — Content-based personalized recommendations
- `GET /api/recommendations/similar/:bookId` — Books similar to a specific title (TF-IDF vector matching)
- `GET /api/recommendations/by-genre` — Clustered recommendations by user's favorite genres *(Private)*

### Admin Operations (`/api/admin`)
- `GET /api/admin/dashboard-stats` — KPI analytics, inventory counts, loan rates, and telemetry *(Admin Only)*
- `GET /api/admin/users` — Retrieve registered reader roster *(Admin Only)*
- `PUT /api/admin/users/:id/role` — Promote or demote user roles *(Admin Only)*

---

## 🗄️ Database Schemas

### User
```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed via bcrypt),
  role: 'user' | 'admin',
  favoriteGenres: [String],
  avatar: String,
  bio: String,
  timestamps: true
}
```

### Book
```javascript
{
  title: String (required, indexed),
  author: String (required, indexed),
  ISBN: String (unique, required),
  genre: [String] (required),
  description: String (required),
  publicationYear: Number (required),
  publisher: String,
  coverImage: String,
  totalCopies: Number (default: 5),
  availableCopies: Number (default: 5),
  availability: Boolean,
  averageRating: Number (0 to 5),
  ratingsCount: Number,
  borrowCount: Number,
  tags: [String],
  featured: Boolean,
  pageCount: Number,
  language: String,
  timestamps: true
}
```

### Borrow
```javascript
{
  user: ObjectId -> User,
  book: ObjectId -> Book,
  borrowDate: Date (default: Date.now),
  dueDate: Date (required),
  returnDate: Date (null while active),
  status: 'borrowed' | 'returned' | 'overdue',
  fine: Number,
  notes: String,
  timestamps: true
}
```

### Review
```javascript
{
  user: ObjectId -> User,
  book: ObjectId -> Book,
  rating: Number (1 to 5, required),
  title: String,
  comment: String (required),
  likes: Number,
  timestamps: true
}
```

---

## 💡 Recommendation System Details

The recommendation engine combines multiple algorithmic layers:
1. **Corpus Tokenization & Stopwords**: Cleans synopses, titles, and thematic tags, stripping common English stopwords.
2. **TF-IDF Term Vectors**: Evaluates term importance across the entire catalog.
3. **Cosine Vector Similarity**: Evaluates semantic alignment between book vectors.
4. **Jaccard Genre Similarity**: Quantifies categorical overlap.
5. **Author Affinities**: Recognizes author catalog matches.
6. **User Profile Weighting**:
   - Explicit favorite genres receive **+3.0 weight**.
   - Previous borrowings contribute **+2.0 weight**.
   - 5-star ratings contribute **+3.0 weight**; 1-2 star ratings apply penalties.
7. **Explainability**: Every suggestion provides a computed match percentage and narrative justification so readers know why a title was recommended.

---

## 🛡️ License
MIT License. Open for educational and personal use.
