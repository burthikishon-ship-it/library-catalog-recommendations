import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Compass, Brain, Layers, BookOpen, ArrowRight, Heart } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import BorrowModal from '../components/BorrowModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RecommendationsPage() {
  const { user, isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [genreRecommendations, setGenreRecommendations] = useState({});
  const [favoriteGenres, setFavoriteGenres] = useState([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Borrow modal
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await api.getRecommendations(12);
        if (res.success) {
          setRecommendations(res.recommendations || []);
          setIsPersonalized(res.isPersonalized);
          setFavoriteGenres(res.favoriteGenres || []);
        }

        if (isAuthenticated) {
          const byGenreRes = await api.getRecommendationsByGenre();
          if (byGenreRes.success) {
            setGenreRecommendations(byGenreRes.categorized || {});
          }
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [isAuthenticated]);

  const handleQuickBorrow = (book) => {
    setSelectedBookForBorrow(book);
    setIsBorrowModalOpen(true);
  };

  if (loading) {
    return <LoadingSpinner message="Calculating content-based recommendations..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-brand-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/20 relative overflow-hidden">
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Algorithmic Discovery Hub
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Personalized For Your Taste
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {isPersonalized ? (
              <>
                Tuned specifically for <span className="text-white font-semibold">{user?.name}</span> by analyzing your borrowing patterns, explicit genre affinities, and review scores using TF-IDF term vectors.
              </>
            ) : (
              <>
                Explore books matched by reader consensus, genre clusters, and thematic relevance. Sign in or register to unlock hyper-personalized recommendations tailored to your unique reading journey!
              </>
            )}
          </p>

          {!isAuthenticated && (
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
              >
                Create Account to Personalize
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Recommendations Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Top Recommendations & Match Scores
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Ranked by composite similarity score across description keywords, authors, and genres
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {recommendations.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onQuickBorrow={handleQuickBorrow}
              showReason={true}
            />
          ))}
        </div>
      </section>

      {/* Recommendations Grouped By User's Favorite Genres */}
      {isAuthenticated && Object.keys(genreRecommendations).length > 0 && (
        <section className="space-y-10 pt-6 border-t border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-400" />
              Recommendations by Your Favorite Genres
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Deep dives into specific genres you've bookmarked in your reader profile
            </p>
          </div>

          {Object.entries(genreRecommendations).map(([genreName, books]) => {
            if (!books || books.length === 0) return null;
            return (
              <div key={genreName} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-400" />
                    {genreName}
                  </h3>
                  <Link
                    to={`/catalog?genre=${encodeURIComponent(genreName)}`}
                    className="text-xs text-brand-400 hover:text-brand-300 font-semibold"
                  >
                    View All in {genreName} &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                  {books.slice(0, 4).map((book) => (
                    <BookCard
                      key={book._id}
                      book={book}
                      onQuickBorrow={handleQuickBorrow}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Borrow Modal */}
      <BorrowModal
        book={selectedBookForBorrow}
        isOpen={isBorrowModalOpen}
        onClose={() => {
          setIsBorrowModalOpen(false);
          setSelectedBookForBorrow(null);
        }}
        onSuccess={() => {}}
      />
    </div>
  );
}
