import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import BookCard from './BookCard';

export default function RecommendationCarousel({ title, subtitle, books = [], onQuickBorrow, isPersonalized = false }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!books || books.length === 0) return null;

  return (
    <div className="relative my-8">
      {/* Header with Title and Scroll Controls */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              {title || 'Recommended For You'}
            </h2>
            {isPersonalized && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                AI Matched
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>

        {/* Carousel Prev/Next Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {books.map((book) => (
          <div
            key={book._id}
            className="w-[200px] sm:w-[220px] md:w-[240px] shrink-0 snap-start"
          >
            <BookCard
              book={book}
              onQuickBorrow={onQuickBorrow}
              showReason={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
