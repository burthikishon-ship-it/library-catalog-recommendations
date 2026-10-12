import React from 'react';
import { Filter, RotateCcw, Check, Star } from 'lucide-react';

export default function BookFilterSidebar({
  genres = [],
  selectedGenre,
  onSelectGenre,
  minRating,
  onSelectMinRating,
  availabilityOnly,
  onToggleAvailability,
  sortOption,
  onChangeSort,
  onResetFilters,
}) {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-400" />
          Filter Catalog
        </h3>
        <button
          onClick={onResetFilters}
          className="text-xs text-slate-400 hover:text-brand-400 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Sort By Dropdown */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Sort Results
        </label>
        <select
          value={sortOption}
          onChange={(e) => onChangeSort(e.target.value)}
          className="w-full bg-slate-900 text-xs text-slate-200 rounded-xl px-3 py-2.5 border border-slate-800 focus:outline-none focus:border-brand-500"
        >
          <option value="popularity">Most Popular (Loans)</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Publication Date (Newest)</option>
          <option value="oldest">Publication Date (Oldest)</option>
          <option value="title_asc">Title (A to Z)</option>
          <option value="title_desc">Title (Z to A)</option>
        </select>
      </div>

      {/* In-Stock Availability Toggle */}
      <div>
        <label className="flex items-center gap-2.5 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={availabilityOnly}
            onChange={(e) => onToggleAvailability(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 text-brand-500 focus:ring-brand-500 bg-slate-900"
          />
          <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
            Available Copies Only
          </span>
        </label>
      </div>

      {/* Minimum Star Rating */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Minimum Rating
        </label>
        <div className="space-y-1.5">
          {[
            { label: 'All Ratings', value: '' },
            { label: '4.5 & Above', value: '4.5' },
            { label: '4.0 & Above', value: '4.0' },
            { label: '3.5 & Above', value: '3.5' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => onSelectMinRating(item.value)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                minRating === item.value
                  ? 'bg-brand-500/10 text-brand-300 font-semibold border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {item.value ? <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> : null}
                <span>{item.label}</span>
              </div>
              {minRating === item.value && <Check className="w-3.5 h-3.5 text-brand-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Genres List */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Browse by Genre
        </label>
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectGenre('All')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
              selectedGenre === 'All' || !selectedGenre
                ? 'bg-brand-500/10 text-brand-300 font-semibold border border-brand-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <span>All Genres</span>
            {(selectedGenre === 'All' || !selectedGenre) && <Check className="w-3.5 h-3.5 text-brand-400" />}
          </button>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => onSelectGenre(g)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                selectedGenre === g
                  ? 'bg-brand-500/10 text-brand-300 font-semibold border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span className="truncate">{g}</span>
              {selectedGenre === g && <Check className="w-3.5 h-3.5 text-brand-400" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
