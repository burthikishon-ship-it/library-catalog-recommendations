import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, BookOpen, X, SlidersHorizontal } from 'lucide-react';
import { api } from '../services/api';
import BookCard from '../components/BookCard';
import BookFilterSidebar from '../components/BookFilterSidebar';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import BorrowModal from '../components/BorrowModal';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const currentSearch = searchParams.get('search') || '';
  const currentGenre = searchParams.get('genre') || 'All';
  const currentSort = searchParams.get('sort') || 'popularity';
  const currentMinRating = searchParams.get('minRating') || '';
  const currentAvailability = searchParams.get('availability') === 'true';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  // Component state
  const [books, setBooks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Search input state
  const [localSearch, setLocalSearch] = useState(currentSearch);

  // Borrow modal
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  // Fetch genres once
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await api.getGenres();
        if (res.success) {
          setGenres(res.genres || []);
        }
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };
    fetchGenres();
  }, []);

  // Fetch books when search params change
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = {
          search: currentSearch,
          genre: currentGenre !== 'All' ? currentGenre : undefined,
          sort: currentSort,
          minRating: currentMinRating || undefined,
          availability: currentAvailability ? 'true' : undefined,
          page: currentPage,
          limit: 12,
        };

        const res = await api.getBooks(params);
        if (res.success) {
          setBooks(res.books || []);
          setTotalPages(res.totalPages || 1);
          setTotalBooks(res.totalBooks || 0);
        }
      } catch (err) {
        console.error('Error loading books:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentSearch, currentGenre, currentSort, currentMinRating, currentAvailability, currentPage]);

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val === undefined || val === null || val === '' || val === 'All' || val === false) {
      next.delete(key);
    } else {
      next.set(key, String(val));
    }
    // Reset to page 1 on filter changes unless changing page
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', localSearch.trim());
  };

  const handleResetFilters = () => {
    setLocalSearch('');
    setSearchParams(new URLSearchParams());
  };

  const handleQuickBorrow = (book) => {
    setSelectedBookForBorrow(book);
    setIsBorrowModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-400" />
            Library Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse {totalBooks} titles across literature, science, technology, and philosophy
          </p>
        </div>

        {/* Search input in catalog */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-900 text-xs text-slate-200 placeholder-slate-400 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('');
                  updateParam('search', '');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(currentSearch || currentGenre !== 'All' || currentMinRating || currentAvailability) && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium">Active Filters:</span>
          {currentSearch && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200">
              Query: "{currentSearch}"
              <button onClick={() => { setLocalSearch(''); updateParam('search', ''); }}>
                <X className="w-3 h-3 hover:text-rose-400" />
              </button>
            </span>
          )}
          {currentGenre !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-300">
              Genre: {currentGenre}
              <button onClick={() => updateParam('genre', 'All')}>
                <X className="w-3 h-3 hover:text-rose-400" />
              </button>
            </span>
          )}
          {currentMinRating && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300">
              ★ {currentMinRating}+
              <button onClick={() => updateParam('minRating', '')}>
                <X className="w-3 h-3 hover:text-rose-400" />
              </button>
            </span>
          )}
          {currentAvailability && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              Available Only
              <button onClick={() => updateParam('availability', false)}>
                <X className="w-3 h-3 hover:text-rose-400" />
              </button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-slate-400 hover:text-brand-400 underline ml-2 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Catalog Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:block md:col-span-1 sticky top-24">
          <BookFilterSidebar
            genres={genres}
            selectedGenre={currentGenre}
            onSelectGenre={(g) => updateParam('genre', g)}
            minRating={currentMinRating}
            onSelectMinRating={(r) => updateParam('minRating', r)}
            availabilityOnly={currentAvailability}
            onToggleAvailability={(v) => updateParam('availability', v)}
            sortOption={currentSort}
            onChangeSort={(s) => updateParam('sort', s)}
            onResetFilters={handleResetFilters}
          />
        </aside>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 flex flex-col justify-end">
            <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 max-h-[85vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">Filter Catalog</h3>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <BookFilterSidebar
                genres={genres}
                selectedGenre={currentGenre}
                onSelectGenre={(g) => { updateParam('genre', g); setMobileFilterOpen(false); }}
                minRating={currentMinRating}
                onSelectMinRating={(r) => { updateParam('minRating', r); setMobileFilterOpen(false); }}
                availabilityOnly={currentAvailability}
                onToggleAvailability={(v) => updateParam('availability', v)}
                sortOption={currentSort}
                onChangeSort={(s) => { updateParam('sort', s); setMobileFilterOpen(false); }}
                onResetFilters={() => { handleResetFilters(); setMobileFilterOpen(false); }}
              />
            </div>
          </div>
        )}

        {/* Books Grid */}
        <main className="md:col-span-3 space-y-6">
          {loading ? (
            <LoadingSpinner message="Querying library catalog..." />
          ) : books.length === 0 ? (
            <EmptyState
              title="No books match your criteria"
              description="Try adjusting or clearing your filters, or search with different keywords."
              actionText="Reset Filters"
              onAction={handleResetFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
                {books.map((book) => (
                  <BookCard
                    key={book._id}
                    book={book}
                    onQuickBorrow={handleQuickBorrow}
                  />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => updateParam('page', p)}
              />
            </>
          )}
        </main>
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
          // Refresh books
          updateParam('page', currentPage);
        }}
      />
    </div>
  );
}
