import React, { useState } from 'react';
import { X, Calendar, Clock, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function BorrowModal({ book, isOpen, onClose, onSuccess }) {
  const [duration, setDuration] = useState(14);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();

  if (!isOpen || !book) return null;

  const calculateDueDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + Number(days));
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleBorrow = async () => {
    if (!isAuthenticated) {
      error('Please sign in or register to borrow books from the library');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await api.borrowBook(book._id, duration);
      if (res.success) {
        success(res.message || `Successfully borrowed "${book.title}"!`);
        if (onSuccess) onSuccess(res.borrow);
        onClose();
      }
    } catch (err) {
      error(err.message || 'Failed to borrow book');
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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Borrow Book</h3>
            <p className="text-xs text-slate-400">Confirm your loan terms and due date</p>
          </div>
        </div>

        {/* Book Preview */}
        <div className="flex gap-4 p-3 bg-slate-900/60 rounded-2xl border border-slate-800 mb-6">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-16 h-24 object-cover rounded-xl shadow-md bg-slate-800"
          />
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h4 className="text-sm font-bold text-white truncate">{book.title}</h4>
            <p className="text-xs text-slate-400 truncate">by {book.author}</p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                ISBN: {book.ISBN}
              </span>
              <span className="text-emerald-400 font-medium text-[11px]">
                {book.availableCopies} Copies Available
              </span>
            </div>
          </div>
        </div>

        {/* Loan Duration Selector */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Select Loan Period
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[7, 14, 21].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setDuration(days)}
                className={`py-3 px-3 rounded-xl border text-center transition-all ${
                  duration === days
                    ? 'bg-brand-500/20 border-brand-500 text-brand-300 font-bold shadow-md shadow-brand-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="text-sm">{days} Days</div>
                <div className="text-[10px] text-slate-400 font-normal mt-0.5">Standard Loan</div>
              </button>
            ))}
          </div>
        </div>

        {/* Due Date Summary Card */}
        <div className="p-3.5 rounded-2xl bg-brand-950/20 border border-brand-500/20 flex items-center justify-between mb-6 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-brand-400" />
            <span>Scheduled Return Due Date:</span>
          </div>
          <span className="font-bold text-brand-300">
            {calculateDueDate(duration)}
          </span>
        </div>

        {/* Policy Checklist */}
        <div className="space-y-1.5 mb-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Free digital lending with zero upfront deposit</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Instant return available anytime from your User Dashboard</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-900 transition-colors text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleBorrow}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-bold text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                Confirm Loan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
