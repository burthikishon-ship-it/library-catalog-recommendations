import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookMarked,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Heart,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import RecommendationCarousel from '../components/RecommendationCarousel';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import BorrowModal from '../components/BorrowModal';
import KietLogo from '../components/KietLogo';

export default function UserDashboardPage() {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { success, error } = useNotification();

  const [activeLoans, setActiveLoans] = useState([]);
  const [returnedLoans, setReturnedLoans] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);

  // Quick borrow modal
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState(null);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);

  // Active tab: 'loans' | 'history' | 'recommendations'
  const [activeTab, setActiveTab] = useState('loans');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [borrowsRes, recRes] = await Promise.all([
        api.getMyBorrows('all'),
        api.getRecommendations(8),
      ]);

      if (borrowsRes.success) {
        const loans = borrowsRes.borrows || [];
        setActiveLoans(loans.filter((b) => b.status === 'borrowed'));
        setReturnedLoans(loans.filter((b) => b.status === 'returned'));
      }

      if (recRes.success) {
        setRecommendations(recRes.recommendations || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleReturnBook = async (borrowId, bookTitle) => {
    setReturningId(borrowId);
    try {
      const res = await api.returnBook(borrowId);
      if (res.success) {
        success(`Successfully returned "${bookTitle}"!`);
        loadDashboardData();
      }
    } catch (err) {
      error(err.message || 'Failed to process book return');
    } finally {
      setReturningId(null);
    }
  };

  const getDaysRemaining = (dueDateStr) => {
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffMs = due - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return <LoadingSpinner message="Loading reader dashboard & active loans..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* User Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-16 h-16 rounded-2xl object-cover bg-slate-900 ring-2 ring-brand-500/40 shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                  KIET College Kakinada • Central Library Portal
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Reader Member • Member ID: #{user?._id?.slice(-6).toUpperCase()}
              </p>
              {user?.favoriteGenres && user.favoriteGenres.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Favorites:</span>
                  {user.favoriteGenres.map((g) => (
                    <span key={g} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Link
            to="/catalog"
            className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
          >
            <BookMarked className="w-4 h-4" />
            Borrow More Books
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Loans</span>
            <div className="text-2xl font-extrabold text-brand-400 mt-1">{activeLoans.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
            <BookMarked className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Reads</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{returnedLoans.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recommended Picks</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{recommendations.length}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('loans')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'loans'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Currently Borrowed ({activeLoans.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-brand-500 text-brand-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Borrowing History ({returnedLoans.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'loans' && (
        <section className="space-y-4">
          {activeLoans.length === 0 ? (
            <EmptyState
              title="No active borrowed books"
              description="You have no books currently checked out. Browse the catalog to borrow your next read!"
              actionText="Explore Library Catalog"
              actionLink="/catalog"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeLoans.map((loan) => {
                const b = loan.book;
                const daysLeft = getDaysRemaining(loan.dueDate);
                const isOverdue = daysLeft < 0;

                return (
                  <div
                    key={loan._id}
                    className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={b?.coverImage}
                        alt={b?.title}
                        className="w-14 h-20 object-cover rounded-xl shadow bg-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <Link to={`/books/${b?._id}`} className="hover:text-brand-400 transition-colors">
                          <h4 className="text-sm font-bold text-white truncate">{b?.title}</h4>
                        </Link>
                        <p className="text-xs text-slate-400 truncate">by {b?.author}</p>
                        
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <span
                            className={`px-2 py-0.5 rounded-full font-semibold text-[10px] flex items-center gap-1 ${
                              isOverdue
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : daysLeft <= 3
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {isOverdue
                              ? `Overdue by ${Math.abs(daysLeft)} days`
                              : `${daysLeft} days remaining`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800/80">
                      <div className="text-[11px] text-slate-400">
                        Due: <span className="text-slate-200 font-medium">{new Date(loan.dueDate).toLocaleDateString()}</span>
                      </div>
                      <button
                        onClick={() => handleReturnBook(loan._id, b?.title)}
                        disabled={returningId === loan._id}
                        className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {returningId === loan._id ? 'Returning...' : 'Return Book'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === 'history' && (
        <section className="space-y-4">
          {returnedLoans.length === 0 ? (
            <EmptyState
              title="No past loan history"
              description="Books you return will be preserved here in your personal reading archive."
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Book Title</th>
                    <th className="p-3.5">Author</th>
                    <th className="p-3.5">Borrowed On</th>
                    <th className="p-3.5">Returned On</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {returnedLoans.map((loan) => (
                    <tr key={loan._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-semibold text-white flex items-center gap-2">
                        <Link to={`/books/${loan.book?._id}`} className="hover:text-brand-400">
                          {loan.book?.title}
                        </Link>
                      </td>
                      <td className="p-3.5 text-slate-400">{loan.book?.author}</td>
                      <td className="p-3.5">{new Date(loan.borrowDate).toLocaleDateString()}</td>
                      <td className="p-3.5 text-emerald-400">
                        {loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : 'Returned'}
                      </td>
                      <td className="p-3.5 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Personalized Recommendations Carousel */}
      {recommendations.length > 0 && (
        <section className="pt-8 border-t border-slate-800">
          <RecommendationCarousel
            title="Curated Recommendations For You"
            subtitle="Calculated by the recommendation engine based on your reading affinities and ratings"
            books={recommendations}
            onQuickBorrow={(b) => {
              setSelectedBookForBorrow(b);
              setIsBorrowModalOpen(true);
            }}
            isPersonalized={true}
          />
        </section>
      )}

      {/* Quick Borrow Modal */}
      <BorrowModal
        book={selectedBookForBorrow}
        isOpen={isBorrowModalOpen}
        onClose={() => {
          setIsBorrowModalOpen(false);
          setSelectedBookForBorrow(null);
        }}
        onSuccess={() => loadDashboardData()}
      />
    </div>
  );
}
