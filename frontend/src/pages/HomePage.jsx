import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  ShieldCheck,
  Compass,
  Cpu,
  Brain,
  Feather,
  Flame,
  Globe2,
  Code2,
  Laptop,
  Calculator,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RecommendationCarousel from '../components/RecommendationCarousel';
import BookCard from '../components/BookCard';
import BorrowModal from '../components/BorrowModal';
import LoadingSpinner from '../components/LoadingSpinner';
import KietLogo from '../components/KietLogo';

export default function HomePage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Borrow modal state
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [featuredRes, recRes] = await Promise.all([
          api.getFeaturedBooks(),
          api.getRecommendations(8),
        ]);

        if (featuredRes.success) {
          setFeaturedBooks(featuredRes.featured || []);
          setPopularBooks(featuredRes.popular || []);
        }

        if (recRes.success) {
          setRecommendations(recRes.recommendations || []);
          setIsPersonalized(recRes.isPersonalized);
        }
      } catch (err) {
        console.error('Error fetching home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  const handleQuickBorrow = (book) => {
    setSelectedBookForBorrow(book);
    setIsBorrowModalOpen(true);
  };

  const genresList = [
    { name: 'Programming', icon: Code2, color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400' },
    { name: 'Computer Science', icon: Laptop, color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400' },
    { name: 'Engineering', icon: Layers, color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400' },
    { name: 'Mathematics', icon: Calculator, color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400' },
    { name: 'Technology', icon: Cpu, color: 'from-teal-500/20 to-cyan-500/10 border-teal-500/30 text-teal-400' },
    { name: 'Science Fiction', icon: Compass, color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400' },
    { name: 'Philosophy', icon: Brain, color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400' },
    { name: 'Fiction', icon: Feather, color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400' },
  ];

  return (
    <div className="space-y-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center flex flex-col items-center">
          
          {/* Official KIET College Kakinada Logo Banner */}
          <div className="mb-6 animate-in fade-in duration-500">
            <KietLogo variant="hero" showSubtitle={true} />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-300 text-xs font-semibold tracking-wide uppercase mb-6 animate-in fade-in duration-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            KIET Central Library • Smart Catalog & AI Recommendation Portal
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Discover Your Next Great Read With{' '}
            <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-teal-200 bg-clip-text text-transparent">
              Intelligent Curation
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Welcome to the KIET Central Library Portal. Browse academic and literary volumes, borrow books seamlessly, and experience content-based recommendations powered by TF-IDF machine learning.
          </p>

          {/* Hero Search Box */}
          <form
            onSubmit={handleHeroSearch}
            className="mt-8 max-w-2xl mx-auto relative group"
          >
            <div className="relative flex items-center p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl focus-within:border-brand-500/80 focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search by title, author, keyword, ISBN, or topic..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Statistics Strip */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="glass-panel p-4 rounded-2xl text-center border border-slate-800/80">
              <div className="text-2xl font-extrabold text-white">24+</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Classic & Modern Books</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl text-center border border-slate-800/80">
              <div className="text-2xl font-extrabold text-brand-400">100%</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Free Lending</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl text-center border border-slate-800/80">
              <div className="text-2xl font-extrabold text-amber-400">TF-IDF</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Vector AI Match</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl text-center border border-slate-800/80">
              <div className="text-2xl font-extrabold text-teal-300">14 Days</div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Loan Duration</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Recommendation Showcase Carousel */}
        {recommendations.length > 0 && (
          <section>
            <RecommendationCarousel
              title={isPersonalized ? `Curated For ${user?.name || 'You'}` : 'Top Recommended Books'}
              subtitle={
                isPersonalized
                  ? 'Calculated from your favorite genres, past loans, and rating activity'
                  : 'Popular titles matched by community ratings and literary affinity'
              }
              books={recommendations}
              onQuickBorrow={handleQuickBorrow}
              isPersonalized={isPersonalized}
            />
          </section>
        )}

        {/* Explore by Genre Section */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-400" />
                Explore by Genre
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Browse our curated collections categorized across diverse genres
              </p>
            </div>
            <Link
              to="/catalog"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              All Categories &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {genresList.map((g) => {
              const Icon = g.icon;
              return (
                <Link
                  key={g.name}
                  to={`/catalog?genre=${encodeURIComponent(g.name)}`}
                  className={`group glass-card p-4 rounded-2xl border bg-gradient-to-br ${g.color} hover:scale-105 transition-all text-center flex flex-col items-center justify-center`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900/60 flex items-center justify-center mb-2 shadow group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-100 group-hover:text-white line-clamp-1">
                    {g.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured & Trending Grid */}
        <section>
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                Featured & Popular Titles
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Most actively borrowed and acclaimed books in the library
              </p>
            </div>
            <Link
              to="/catalog?sort=popularity"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              View Full Catalog &rarr;
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading catalog highlights..." />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {(featuredBooks.length > 0 ? featuredBooks : popularBooks).slice(0, 8).map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  onQuickBorrow={handleQuickBorrow}
                />
              ))}
            </div>
          )}
        </section>

        {/* How It Works Banner */}
        <section className="glass-panel rounded-3xl p-8 lg:p-12 border border-slate-800/80 relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Seamless Experience</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-4">
              How the Library System Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-8">
              Designed for readers, students, and researchers. No complicated paperwork—just immediate access and smart recommendations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-brand-400 font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h4 className="text-sm font-bold text-slate-200">Search & Filter</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Query by title, author, ISBN, or keywords with instant live autocomplete.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-brand-400 font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h4 className="text-sm font-bold text-slate-200">1-Click Loan</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select your loan duration (7, 14, or 21 days) and track due dates on your dashboard.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h4 className="text-sm font-bold text-slate-200">AI Recommendations</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our TF-IDF cosine similarity engine suggests your next book based on your history.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Borrow Modal */}
      <BorrowModal
        book={selectedBookForBorrow}
        isOpen={isBorrowModalOpen}
        onClose={() => {
          setIsBorrowModalOpen(false);
          setSelectedBookForBorrow(null);
        }}
        onSuccess={() => {
          // Re-fetch recommendations and books
        }}
      />
    </div>
  );
}
