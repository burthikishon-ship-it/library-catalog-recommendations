import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Search, User, LogOut, ShieldCheck, Sparkles, BookMarked, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import KietLogo from './KietLogo';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setShowSearchDropdown(false);
  }, [location.pathname]);

  // Click outside listener for search & user dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.getBooks({ search: searchQuery.trim(), limit: 5 });
        if (res.success) {
          setSearchResults(res.books || []);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error('Navbar search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectBook = (bookId) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/books/${bookId}`);
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo with Official KIET Emblem */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <KietLogo className="h-8" />
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5 leading-none">
                KIET <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/30 font-semibold">Central Library</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Kakinada Campus
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar with Live Autocomplete Dropdown */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search books, authors, ISBNs, or genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowSearchDropdown(true);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/90 text-sm text-slate-200 placeholder-slate-400 rounded-full border border-slate-800 focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all shadow-inner"
                />
                {isSearching && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </form>

            {/* Instant Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 top-full mt-2 glass-dropdown rounded-2xl shadow-2xl p-2 z-50 overflow-hidden border border-slate-700/60">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 py-1.5 border-b border-slate-800/80 flex justify-between items-center">
                  <span>Quick Results</span>
                  <span className="text-[10px] text-brand-400">Press Enter to view all</span>
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-400">
                    No books found matching "{searchQuery}"
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {searchResults.map((book) => (
                      <button
                        key={book._id}
                        onClick={() => handleSelectBook(book._id)}
                        className="w-full text-left p-2.5 flex items-center gap-3 hover:bg-slate-800/60 rounded-xl transition-colors group"
                      >
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-10 h-14 object-cover rounded shadow-md shrink-0 bg-slate-800"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-slate-200 group-hover:text-brand-400 truncate">
                            {book.title}
                          </h4>
                          <p className="text-xs text-slate-400 truncate">{book.author}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {Array.isArray(book.genre) ? book.genre[0] : book.genre}
                            </span>
                            <span className="text-xs text-amber-400 font-medium">★ {book.averageRating || 'New'}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full p-2 text-center text-xs font-semibold text-brand-400 hover:text-brand-300 hover:bg-slate-800/40 rounded-lg mt-1 transition-colors"
                    >
                      View all results for "{searchQuery}" &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/catalog"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === '/catalog'
                  ? 'text-brand-400 bg-brand-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Catalog
            </Link>
            <Link
              to="/recommendations"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/recommendations'
                  ? 'text-brand-400 bg-brand-500/10'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Recommendations
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  location.pathname === '/dashboard'
                    ? 'text-brand-400 bg-brand-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <BookMarked className="w-4 h-4 text-brand-400" />
                My Loans
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin')
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                    : 'text-amber-300 hover:text-amber-200 hover:bg-amber-950/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Admin Panel
              </Link>
            )}
          </div>

          {/* User Profile / Auth Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {isAuthenticated ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-900 border border-slate-800 transition-colors"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover bg-slate-800 ring-2 ring-brand-500/30"
                  />
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold text-slate-200 leading-none">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize mt-0.5">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-dropdown rounded-2xl shadow-2xl p-1.5 border border-slate-700/60 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-medium text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-200 truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Administrator
                        </span>
                      )}
                    </div>
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <BookMarked className="w-4 h-4 text-brand-400" />
                        My Dashboard & Loans
                      </Link>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Account Profile
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-950/30 rounded-xl transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                          Admin Console
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-slate-800 pt-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-gradient-to-r from-brand-400 to-brand-500 hover:from-brand-300 hover:to-brand-400 rounded-xl shadow-md shadow-brand-500/20 transition-all hover:scale-105"
                >
                  Join Library
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 p-4 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 text-sm text-slate-200 placeholder-slate-400 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
            />
          </form>

          <div className="flex flex-col space-y-1 pt-2">
            <Link
              to="/catalog"
              className="px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-xl"
            >
              Catalog
            </Link>
            <Link
              to="/recommendations"
              className="px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-xl flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Recommendations
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-xl flex items-center gap-2"
                >
                  <BookMarked className="w-4 h-4 text-brand-400" />
                  My Dashboard & Loans
                </Link>
                <Link
                  to="/profile"
                  className="px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900 rounded-xl flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 text-sm font-medium text-amber-300 hover:bg-amber-950/40 rounded-xl flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Admin Dashboard
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80">
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-400 bg-rose-950/30 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user.name})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-center text-sm font-medium text-slate-300 bg-slate-900 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-center text-sm font-semibold text-slate-950 bg-brand-400 rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
