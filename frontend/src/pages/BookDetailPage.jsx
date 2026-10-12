import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Star,
  Calendar,
  Layers,
  FileText,
  Building,
  Hash,
  Sparkles,
  CheckCircle2,
  Clock,
  MessageSquarePlus,
  Share2,
  ArrowLeft,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import BookCard from '../components/BookCard';
import BorrowModal from '../components/BorrowModal';
import ReviewModal from '../components/ReviewModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarBooks, setSimilarBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const { isAuthenticated } = useAuth();
  const { info } = useNotification();

  const loadBookData = async () => {
    setLoading(true);
    try {
      const [bookRes, similarRes] = await Promise.all([
        api.getBookById(id),
        api.getSimilarBooks(id, 4),
      ]);

      if (bookRes.success) {
        setBook(bookRes.book);
        setReviews(bookRes.reviews || []);
      }

      if (similarRes.success) {
        setSimilarBooks(similarRes.similarBooks || []);
      }
    } catch (err) {
      console.error('Error fetching book detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Loading book details & literary analysis..." />;
  }

  if (!book) {
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Book Not Found</h2>
        <p className="text-xs text-slate-400 mb-6">The book record you requested does not exist or was removed.</p>
        <Link to="/catalog" className="text-brand-400 font-semibold text-xs hover:underline">
          &larr; Return to Library Catalog
        </Link>
      </div>
    );
  }

  const isAvailable = book.availableCopies > 0 && book.availability !== false;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `Check out "${book.title}" by ${book.author} on Athena Library!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      info('Book link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Back link */}
      <div>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library Catalog
        </Link>
      </div>

      {/* Hero Book Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cover Column */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col items-center">
          <div className="relative w-64 sm:w-72 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 group">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-50" />
            
            {/* Top Match Badge if computed */}
            {book.featured && (
              <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 shadow flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Featured Pick
              </span>
            )}
          </div>

          {/* Share Action */}
          <button
            onClick={handleShare}
            className="mt-4 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share this book
          </button>
        </div>

        {/* Details Column */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-6">
          
          {/* Header Title & Author */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {book.genre?.map((g) => (
                <Link
                  key={g}
                  to={`/catalog?genre=${encodeURIComponent(g)}`}
                  className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/25 hover:bg-brand-500/20 transition-colors"
                >
                  {g}
                </Link>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight title-font">
              {book.title}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-medium mt-1">
              by <span className="text-brand-300">{book.author}</span>
            </p>

            {/* Rating summary */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-base">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{book.averageRating ? book.averageRating.toFixed(1) : 'New'}</span>
              </div>
              <span className="text-xs text-slate-400">
                ({book.ratingsCount || 0} reader ratings)
              </span>
              <span className="text-slate-700">•</span>
              <span className="text-xs text-slate-400">
                {book.borrowCount || 0} Total Borrows
              </span>
            </div>
          </div>

          {/* Availability & Borrow Action Box */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span className="text-sm font-bold text-white">
                  {isAvailable ? 'In Stock for Immediate Borrowing' : 'Currently Fully Loaned Out'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {book.availableCopies} of {book.totalCopies} physical/digital copies ready for checkout
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isAvailable ? (
                <button
                  onClick={() => setIsBorrowModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  Borrow Book Now
                </button>
              ) : (
                <button
                  disabled
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 text-slate-500 font-semibold text-xs cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  All Copies Checked Out
                </button>
              )}
            </div>
          </div>

          {/* Book Synopsis */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Synopsis</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
              {book.description}
            </p>
          </div>

          {/* Metadata Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="glass-card p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-brand-400" />
                Published
              </span>
              <span className="text-xs font-semibold text-slate-200 block mt-1">
                {book.publicationYear}
              </span>
            </div>

            <div className="glass-card p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Building className="w-3 h-3 text-brand-400" />
                Publisher
              </span>
              <span className="text-xs font-semibold text-slate-200 block mt-1 truncate" title={book.publisher}>
                {book.publisher || 'Independent'}
              </span>
            </div>

            <div className="glass-card p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <Hash className="w-3 h-3 text-brand-400" />
                ISBN
              </span>
              <span className="text-xs font-mono font-semibold text-slate-200 block mt-1 truncate">
                {book.ISBN}
              </span>
            </div>

            <div className="glass-card p-3 rounded-xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <FileText className="w-3 h-3 text-brand-400" />
                Pages
              </span>
              <span className="text-xs font-semibold text-slate-200 block mt-1">
                {book.pageCount || 320} Pages
              </span>
            </div>
          </div>

          {/* Tags */}
          {book.tags && book.tags.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Thematic Keywords & Metadata
              </span>
              <div className="flex flex-wrap gap-1.5">
                {book.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Reviews & Community Feedback Section */}
      <section className="pt-8 border-t border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Reader Reviews & Ratings
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Read community insights or submit your own review
            </p>
          </div>

          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 font-semibold text-xs transition-all flex items-center gap-1.5"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Write a Review
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center border border-slate-800 text-slate-400 text-xs">
            No reviews yet for this title. Be the first to share your thoughts!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="glass-card p-4 rounded-2xl border border-slate-800/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${rev.user?.name || 'Reader'}`}
                      alt={rev.user?.name}
                      className="w-8 h-8 rounded-full object-cover bg-slate-800"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{rev.user?.name || 'Reader'}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.title && (
                  <h5 className="text-xs font-bold text-slate-200">{rev.title}</h5>
                )}

                <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Similar Books Recommended By TF-IDF Cosine Similarity */}
      {similarBooks.length > 0 && (
        <section className="pt-8 border-t border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Readers Also Enjoyed
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Content-based literary recommendations computed from genre, thematic synopsis, and author affinities
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {similarBooks.map((simBook) => (
              <BookCard
                key={simBook._id}
                book={simBook}
                showReason={true}
                onQuickBorrow={() => {
                  setBook(simBook);
                  setIsBorrowModalOpen(true);
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Borrow Modal */}
      <BorrowModal
        book={book}
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        onSuccess={() => loadBookData()}
      />

      {/* Review Modal */}
      <ReviewModal
        book={book}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => loadBookData()}
      />
    </div>
  );
}
