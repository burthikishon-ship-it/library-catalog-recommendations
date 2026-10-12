import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, BookOpen, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function BookCard({ book, onQuickBorrow, showReason = false }) {
  const [imgError, setImgError] = useState(false);

  const fallbackCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80';
  const isAvailable = book.availableCopies > 0 && book.availability !== false;
  const primaryGenre = Array.isArray(book.genre) ? book.genre[0] : book.genre;

  return (
    <div className="group relative glass-card rounded-2xl p-3.5 flex flex-col justify-between border border-slate-800 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 hover:-translate-y-1">
      
      {/* Top Cover Image Area */}
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-slate-900 mb-3 shadow-md">
        <img
          src={imgError ? fallbackCover : (book.coverImage || fallbackCover)}
          alt={book.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
          {/* Availability Status Badge */}
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-md shadow flex items-center gap-1 ${
              isAvailable
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
            }`}
          >
            {isAvailable ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {book.availableCopies} Left
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 text-rose-400" />
                Waitlist
              </>
            )}
          </span>

          {/* Match Score Badge (if recommendation) */}
          {book.matchPercentage && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/90 text-slate-950 shadow flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {book.matchPercentage}%
            </span>
          )}
        </div>

        {/* Genre Pill on Cover */}
        <div className="absolute bottom-2 left-2">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-md text-brand-300 border border-slate-700/60 shadow">
            {primaryGenre}
          </span>
        </div>
      </div>

      {/* Book Metadata */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/books/${book._id}`}>
            <h3 className="text-sm font-bold text-slate-100 group-hover:text-brand-400 transition-colors line-clamp-1 title-font" title={book.title}>
              {book.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
            by {book.author}
          </p>

          {/* Recommendation Reason Pill */}
          {showReason && book.recommendationReason && (
            <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-950/40 border border-amber-800/40 rounded-lg px-2 py-1 flex items-center gap-1.5 line-clamp-1">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{book.recommendationReason}</span>
            </div>
          )}

          {/* Rating and Year */}
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/70 text-xs">
            <div className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{book.averageRating ? book.averageRating.toFixed(1) : 'New'}</span>
              <span className="text-[11px] text-slate-400 font-normal">({book.ratingsCount || 0})</span>
            </div>
            <span className="text-slate-400 text-[11px]">
              {book.publicationYear}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-3 pt-2">
          {isAvailable ? (
            <button
              onClick={() => onQuickBorrow && onQuickBorrow(book)}
              className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30 hover:bg-brand-500 hover:text-slate-950 hover:border-brand-500 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Borrow Book
            </button>
          ) : (
            <Link
              to={`/books/${book._id}`}
              className="w-full py-2 px-3 text-xs font-medium rounded-xl bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300 transition-colors flex items-center justify-center gap-1.5 text-center"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
