/**
 * Library Recommendation Engine
 * Content-based filtering using TF-IDF vectorization, Cosine Similarity,
 * Genre Jaccard similarity, and User Profile preference weighting.
 */

// Common English stopwords to filter out for TF-IDF
const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could', 'couldn\'t',
  'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here',
  'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it',
  'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my',
  'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t',
  'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some',
  'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
  'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were',
  'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would',
  'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours',
  'yourself', 'yourselves', 'book', 'story', 'novel', 'world', 'life', 'one', 'new'
]);

// Tokenize text into normalized lowercase alphanumeric terms
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOPWORDS.has(token));
}

// Compute Term Frequency (TF) for a document
function computeTF(tokens) {
  const tf = {};
  const total = tokens.length || 1;
  for (const t of tokens) {
    tf[t] = (tf[t] || 0) + 1;
  }
  for (const t in tf) {
    tf[t] = tf[t] / total;
  }
  return tf;
}

// Compute Inverse Document Frequency (IDF) over all books
function computeIDF(corpusTokensList) {
  const docCount = corpusTokensList.length;
  const df = {};

  for (const tokens of corpusTokensList) {
    const uniqueTokens = new Set(tokens);
    for (const t of uniqueTokens) {
      df[t] = (df[t] || 0) + 1;
    }
  }

  const idf = {};
  for (const t in df) {
    // Smoothed logarithmic IDF
    idf[t] = Math.log(1 + (docCount / (1 + df[t])));
  }
  return idf;
}

// Compute Cosine Similarity between two TF-IDF vectors
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key in vecA) {
    const valA = vecA[key];
    normA += valA * valA;
    if (vecB[key] !== undefined) {
      dotProduct += valA * vecB[key];
    }
  }

  for (const key in vecB) {
    normB += vecB[key] * vecB[key];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
}

// Compute Jaccard Similarity between two arrays of items
function jaccardSimilarity(arrA, arrB) {
  if (!arrA || !arrB || arrA.length === 0 || arrB.length === 0) return 0;
  const setA = new Set(arrA.map(s => String(s).toLowerCase().trim()));
  const setB = new Set(arrB.map(s => String(s).toLowerCase().trim()));

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }

  const unionCount = setA.size + setB.size - intersectionCount;
  if (unionCount === 0) return 0;
  return intersectionCount / unionCount;
}

class RecommendationEngine {
  /**
   * Calculate pairwise similarity between a base book and a candidate book
   */
  static calculateBookSimilarity(baseBook, candidateBook, idfMap) {
    if (String(baseBook._id) === String(candidateBook._id)) {
      return { score: 1.0, reason: 'Identical' };
    }

    // 1. Genre Similarity (Weight: 45%)
    const genreScore = jaccardSimilarity(baseBook.genre, candidateBook.genre);

    // 2. Author Similarity (Weight: 20%)
    let authorScore = 0;
    if (baseBook.author && candidateBook.author) {
      if (baseBook.author.toLowerCase() === candidateBook.author.toLowerCase()) {
        authorScore = 1.0;
      }
    }

    // 3. TF-IDF Description & Tag Content Similarity (Weight: 25%)
    const baseTokens = [
      ...tokenize(baseBook.description),
      ...tokenize(baseBook.title),
      ...(baseBook.tags || []).flatMap(t => tokenize(t))
    ];
    const candidateTokens = [
      ...tokenize(candidateBook.description),
      ...tokenize(candidateBook.title),
      ...(candidateBook.tags || []).flatMap(t => tokenize(t))
    ];

    const baseTF = computeTF(baseTokens);
    const candidateTF = computeTF(candidateTokens);

    const baseVec = {};
    const candidateVec = {};
    for (const t in baseTF) {
      baseVec[t] = baseTF[t] * (idfMap[t] || 1);
    }
    for (const t in candidateTF) {
      candidateVec[t] = candidateTF[t] * (idfMap[t] || 1);
    }

    const textSim = cosineSimilarity(baseVec, candidateVec);

    // 4. Rating Quality Factor (Weight: 10%)
    const ratingScore = (candidateBook.averageRating || 0) / 5.0;

    const compositeScore =
      0.45 * genreScore +
      0.20 * authorScore +
      0.25 * textSim +
      0.10 * ratingScore;

    let reason = 'Similar literary themes';
    if (authorScore === 1.0) {
      reason = `Another acclaimed title by ${candidateBook.author}`;
    } else if (genreScore > 0.6) {
      const shared = baseBook.genre.filter(g =>
        candidateBook.genre.some(cg => cg.toLowerCase() === g.toLowerCase())
      );
      reason = `Shared genres: ${shared.slice(0, 2).join(', ')}`;
    } else if (textSim > 0.3) {
      reason = 'Closely matching synopsis and thematic keywords';
    }

    return {
      score: compositeScore,
      reason,
      matchPercentage: Math.min(99, Math.max(50, Math.round(compositeScore * 100)))
    };
  }

  /**
   * Find books similar to a given book ID (e.g. for Book Details page)
   */
  static getSimilarBooks(targetBook, allBooks, limit = 5) {
    if (!targetBook || !allBooks || allBooks.length === 0) return [];

    // Precompute IDF for the corpus
    const corpusTokens = allBooks.map(b => [
      ...tokenize(b.description),
      ...tokenize(b.title),
      ...(b.tags || []).flatMap(t => tokenize(t))
    ]);
    const idfMap = computeIDF(corpusTokens);

    const candidates = allBooks.filter(
      b => String(b._id) !== String(targetBook._id)
    );

    const scored = candidates.map(cand => {
      const sim = RecommendationEngine.calculateBookSimilarity(targetBook, cand, idfMap);
      return {
        ...cand,
        similarityScore: sim.score,
        recommendationReason: sim.reason,
        matchPercentage: sim.matchPercentage,
      };
    });

    scored.sort((a, b) => b.similarityScore - a.similarityScore);
    return scored.slice(0, limit);
  }

  /**
   * Generate personalized recommendations for a user based on:
   * - Favorite genres
   * - Borrowing history
   * - Reviews & ratings
   * - Popularity & rating quality
   */
  static generateUserRecommendations({
    user,
    allBooks,
    borrowHistory = [],
    userReviews = [],
    limit = 10,
  }) {
    if (!allBooks || allBooks.length === 0) return [];

    // Set of book IDs already interacted with (currently borrowed or read)
    const borrowedBookIds = new Set(
      borrowHistory.map(b => String(b.book?._id || b.book))
    );
    const activeBorrowedBookIds = new Set(
      borrowHistory
        .filter(b => b.status === 'borrowed')
        .map(b => String(b.book?._id || b.book))
    );
    const ratedBookIds = new Map();
    userReviews.forEach(r => {
      ratedBookIds.set(String(r.book?._id || r.book), Number(r.rating) || 3);
    });

    // 1. Build User Profile Preferences
    const genreAffinities = {};
    const authorAffinities = {};

    // A. Explicit Favorite Genres (weight = 3.0)
    if (user && user.favoriteGenres && user.favoriteGenres.length > 0) {
      user.favoriteGenres.forEach(genre => {
        const g = genre.toLowerCase().trim();
        genreAffinities[g] = (genreAffinities[g] || 0) + 3.0;
      });
    }

    // B. Past Borrowings (weight = 2.0 per book)
    borrowHistory.forEach(record => {
      const bookDoc = allBooks.find(b => String(b._id) === String(record.book?._id || record.book));
      if (bookDoc) {
        if (bookDoc.genre) {
          bookDoc.genre.forEach(g => {
            const lowG = g.toLowerCase().trim();
            genreAffinities[lowG] = (genreAffinities[lowG] || 0) + 2.0;
          });
        }
        if (bookDoc.author) {
          const lowA = bookDoc.author.toLowerCase().trim();
          authorAffinities[lowA] = (authorAffinities[lowA] || 0) + 2.0;
        }
      }
    });

    // C. User Reviews & Ratings (5 stars = +3.0, 4 stars = +1.5, 1-2 stars = -2.0)
    userReviews.forEach(rev => {
      const bookDoc = allBooks.find(b => String(b._id) === String(rev.book?._id || rev.book));
      if (bookDoc) {
        const delta = rev.rating >= 4 ? (rev.rating === 5 ? 3.0 : 1.5) : (rev.rating <= 2 ? -2.0 : 0.5);
        if (bookDoc.genre) {
          bookDoc.genre.forEach(g => {
            const lowG = g.toLowerCase().trim();
            genreAffinities[lowG] = (genreAffinities[lowG] || 0) + delta;
          });
        }
        if (bookDoc.author) {
          const lowA = bookDoc.author.toLowerCase().trim();
          authorAffinities[lowA] = (authorAffinities[lowA] || 0) + delta;
        }
      }
    });

    // Precompute corpus IDF
    const corpusTokens = allBooks.map(b => [
      ...tokenize(b.description),
      ...tokenize(b.title),
      ...(b.tags || []).flatMap(t => tokenize(t))
    ]);
    const idfMap = computeIDF(corpusTokens);

    // Max values for normalization
    const maxGenreAffinity = Math.max(1, ...Object.values(genreAffinities));
    const maxAuthorAffinity = Math.max(1, ...Object.values(authorAffinities));
    const maxBorrowCount = Math.max(1, ...allBooks.map(b => b.borrowCount || 0));

    // Score all candidate books
    const scoredBooks = allBooks.map(book => {
      const bookId = String(book._id);

      // Books currently borrowed by user are deprioritized
      const isCurrentlyBorrowed = activeBorrowedBookIds.has(bookId);
      const isAlreadyRead = borrowedBookIds.has(bookId);

      // 1. Genre Affinity Score (0 - 1)
      let bookGenreScore = 0;
      let matchingGenre = null;
      if (book.genre && book.genre.length > 0) {
        book.genre.forEach(g => {
          const val = genreAffinities[g.toLowerCase().trim()] || 0;
          if (val > 0) {
            bookGenreScore += val;
            if (!matchingGenre || val > (genreAffinities[matchingGenre.toLowerCase()] || 0)) {
              matchingGenre = g;
            }
          }
        });
        bookGenreScore = Math.min(1.0, bookGenreScore / maxGenreAffinity);
      }

      // 2. Author Affinity Score (0 - 1)
      const bookAuthorScore = book.author && authorAffinities[book.author.toLowerCase().trim()]
        ? Math.min(1.0, authorAffinities[book.author.toLowerCase().trim()] / maxAuthorAffinity)
        : 0;

      // 3. Overall Rating Quality (0 - 1)
      const ratingScore = (book.averageRating || 0) / 5.0;

      // 4. Popularity Score (0 - 1)
      const popularityScore = (book.borrowCount || 0) / maxBorrowCount;

      // 5. Calculate Composite Recommendation Score
      // If user has affinities, personalize heavily; otherwise fallback to quality & popularity
      const hasUserData = Object.keys(genreAffinities).length > 0 || Object.keys(authorAffinities).length > 0;

      let score = 0;
      let reason = 'Trending in our catalog';

      if (hasUserData) {
        score =
          0.45 * bookGenreScore +
          0.25 * bookAuthorScore +
          0.15 * ratingScore +
          0.15 * popularityScore;

        if (bookAuthorScore > 0.4) {
          reason = `Because you've enjoyed books by ${book.author}`;
        } else if (matchingGenre) {
          reason = `Recommended based on your interest in ${matchingGenre}`;
        } else if (ratingScore >= 0.9) {
          reason = `Top 5-star community favorite (${book.averageRating}★)`;
        } else {
          reason = 'Matches your reading tastes and favorites';
        }
      } else {
        // Cold-start fallback: Top rated & popular books
        score = 0.60 * ratingScore + 0.40 * popularityScore;
        reason = book.averageRating >= 4.7
          ? `Critically acclaimed reader favorite (${book.averageRating}★)`
          : 'Popular across the library';
      }

      // Penalize books already borrowed to prioritize fresh discoveries
      if (isCurrentlyBorrowed) {
        score *= 0.1;
      } else if (isAlreadyRead) {
        score *= 0.6;
      }

      const matchPercentage = Math.min(99, Math.max(55, Math.round(score * 100)));

      return {
        ...book,
        recommendationScore: score,
        recommendationReason: reason,
        matchPercentage,
        isCurrentlyBorrowed,
        isAlreadyRead,
      };
    });

    // Sort by recommendation score descending
    scoredBooks.sort((a, b) => b.recommendationScore - a.recommendationScore);

    return scoredBooks.slice(0, limit);
  }
}

module.exports = RecommendationEngine;
