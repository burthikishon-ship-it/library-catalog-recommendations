import React, { useState } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ReviewModal({ book, isOpen, onClose, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const { isAuthenticated } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();

  if (!isOpen || !book) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      error('Please sign in to write a review');
      navigate('/login');
      return;
    }

    if (!comment.trim()) {
      error('Please write your review thoughts');
      return;
    }

    setLoading(true);
    try {
      const res = await api.addReview({
        bookId: book._id,
        rating,
        title: title.trim(),
        comment: comment.trim(),
      });

      if (res.success) {
        success('Thank you! Your review and rating have been posted.');
        if (onSuccess) onSuccess(res.review);
        onClose();
      }
    } catch (err) {
      error(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 shadow-2xl border border-slate-700/80">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Rate & Review</h3>
            <p className="text-xs text-slate-400 truncate max-w-xs">{book.title}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Interactive Star Rating */}
          <div className="text-center py-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Your Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-125"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700 hover:text-slate-500'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-amber-400 font-semibold mt-1">
              {rating === 5 && 'Outstanding - 5 Stars'}
              {rating === 4 && 'Very Good - 4 Stars'}
              {rating === 3 && 'Good - 3 Stars'}
              {rating === 2 && 'Fair - 2 Stars'}
              {rating === 1 && 'Poor - 1 Star'}
            </p>
          </div>

          {/* Headline / Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Review Headline (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., A mesmerizing sci-fi masterpiece"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 text-sm text-slate-200 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Review & Thoughts *
            </label>
            <textarea
              rows={4}
              required
              placeholder="What did you like or dislike about the pacing, characters, concepts, or themes? How did it impact you?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 text-sm text-slate-200 placeholder-slate-500 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 transition-colors text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Post Review</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
