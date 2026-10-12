import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Edit,
  Trash2,
  Search,
  RotateCcw,
  Sparkles,
  Layers,
  X,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';
import KietLogo from '../components/KietLogo';

export default function AdminDashboardPage() {
  const { success, error } = useNotification();

  const [stats, setStats] = useState(null);
  const [popularBooks, setPopularBooks] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemInfo, setSystemInfo] = useState(null);

  // Tab: 'overview' | 'inventory' | 'borrows' | 'users'
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Inventory Table State
  const [catalogBooks, setCatalogBooks] = useState([]);
  const [bookSearch, setBookSearch] = useState('');
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // All Borrows State
  const [allBorrows, setAllBorrows] = useState([]);
  const [borrowStatusFilter, setBorrowStatusFilter] = useState('all');

  // Users State
  const [usersList, setUsersList] = useState([]);

  // Book Form State for Add / Edit
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    ISBN: '',
    genre: '',
    description: '',
    publicationYear: new Date().getFullYear(),
    publisher: '',
    coverImage: '',
    totalCopies: 5,
    tags: '',
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await api.getAdminStats();
      if (statsRes.success) {
        setStats(statsRes.stats);
        setPopularBooks(statsRes.popularBooks || []);
        setRecentActivity(statsRes.recentActivity || []);
        setSystemInfo(statsRes.systemInfo);
      }

      // Load books list
      const booksRes = await api.getBooks({ limit: 100 });
      if (booksRes.success) {
        setCatalogBooks(booksRes.books || []);
      }

      // Load borrows
      const borrowsRes = await api.getAllBorrows();
      if (borrowsRes.success) {
        setAllBorrows(borrowsRes.borrows || []);
      }

      // Load users
      const usersRes = await api.getAdminUsers();
      if (usersRes.success) {
        setUsersList(usersRes.users || []);
      }
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Filtered inventory books
  const filteredCatalogBooks = catalogBooks.filter((b) => {
    if (!bookSearch.trim()) return true;
    const term = bookSearch.toLowerCase();
    return (
      b.title.toLowerCase().includes(term) ||
      b.author.toLowerCase().includes(term) ||
      b.ISBN.toLowerCase().includes(term)
    );
  });

  // Handle open modal for new book
  const handleOpenAddModal = () => {
    setEditingBook(null);
    setBookForm({
      title: '',
      author: '',
      ISBN: '',
      genre: '',
      description: '',
      publicationYear: new Date().getFullYear(),
      publisher: '',
      coverImage: '',
      totalCopies: 5,
      tags: '',
    });
    setIsBookModalOpen(true);
  };

  // Handle open modal for editing
  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      ISBN: book.ISBN,
      genre: Array.isArray(book.genre) ? book.genre.join(', ') : book.genre,
      description: book.description,
      publicationYear: book.publicationYear,
      publisher: book.publisher || '',
      coverImage: book.coverImage || '',
      totalCopies: book.totalCopies,
      tags: Array.isArray(book.tags) ? book.tags.join(', ') : '',
    });
    setIsBookModalOpen(true);
  };

  // Submit Add or Edit Book
  const handleSaveBook = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...bookForm,
        genre: bookForm.genre.split(',').map((g) => g.trim()),
        tags: bookForm.tags ? bookForm.tags.split(',').map((t) => t.trim()) : [],
        totalCopies: Number(bookForm.totalCopies),
        publicationYear: Number(bookForm.publicationYear),
      };

      if (editingBook) {
        const res = await api.updateBook(editingBook._id, payload);
        if (res.success) {
          success(`Updated "${payload.title}" successfully`);
        }
      } else {
        const res = await api.createBook(payload);
        if (res.success) {
          success(`Added "${payload.title}" to catalog`);
        }
      }

      setIsBookModalOpen(false);
      loadAdminData();
    } catch (err) {
      error(err.message || 'Failed to save book');
    }
  };

  // Delete Book
  const handleDeleteBook = async (bookId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}" from the catalog?`)) {
      return;
    }
    try {
      const res = await api.deleteBook(bookId);
      if (res.success) {
        success(`"${title}" deleted from catalog`);
        loadAdminData();
      }
    } catch (err) {
      error(err.message || 'Cannot delete book');
    }
  };

  // Update user role
  const handleToggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await api.updateUserRole(userId, newRole);
      if (res.success) {
        success(`User role updated to ${newRole}`);
        loadAdminData();
      }
    } catch (err) {
      error(err.message || 'Failed to update user role');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading library admin telemetry..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner with KIET College Emblem */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <KietLogo className="h-12" />
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              KIET Central Library • Administrative Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Library Operations & Inventory
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Kakinada Institute of Engineering & Technology • Manage books, monitor loans, oversee student/staff users
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add New Book
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Titles</span>
            <div className="text-2xl font-extrabold text-white mt-1">{stats.totalBooks}</div>
            <span className="text-[10px] text-slate-500">{stats.totalCopies} Total Copies</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Available In Stock</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.availableCopies}</div>
            <span className="text-[10px] text-emerald-500/80">Ready for checkout</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Active Checked Out</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{stats.activeLoans}</div>
            <span className="text-[10px] text-amber-500/80">Currently with readers</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Registered Users</span>
            <div className="text-2xl font-extrabold text-brand-400 mt-1">{stats.totalUsers}</div>
            <span className="text-[10px] text-brand-500/80">Patrons & Staff</span>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-800 col-span-2 lg:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Database Engine</span>
            <div className="text-sm font-bold text-teal-300 mt-1.5 truncate">
              {systemInfo?.engine || 'Active'}
            </div>
            <span className="text-[10px] text-slate-500">Mongoose / Embedded Dual</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-4 text-xs font-bold uppercase tracking-wider overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-all shrink-0 ${
            activeTab === 'overview'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview & Telemetry
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'inventory'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Catalog Inventory ({catalogBooks.length})
        </button>

        <button
          onClick={() => setActiveTab('borrows')}
          className={`pb-3 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'borrows'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Borrowing Logs ({allBorrows.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Registered Users ({usersList.length})
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Activity Table */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              Recent Borrowing Activity
            </h3>

            <div className="divide-y divide-slate-800/60">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recent activity logged.</p>
              ) : (
                recentActivity.map((act) => (
                  <div key={act._id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={act.book?.coverImage}
                        alt={act.book?.title}
                        className="w-9 h-12 object-cover rounded bg-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{act.book?.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          Borrowed by {act.user?.name} ({act.user?.email})
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          act.status === 'borrowed'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {act.status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {new Date(act.borrowDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Popular Books */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Most Popular Titles by Borrow Count
            </h3>

            <div className="space-y-3">
              {popularBooks.map((b, idx) => (
                <div key={b._id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-xs shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{b.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{b.author}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-brand-400">{b.borrowCount} loans</span>
                    <p className="text-[10px] text-amber-400">★ {b.averageRating}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Catalog Inventory Management */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter catalog by title, author, ISBN..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 text-xs text-slate-200 placeholder-slate-400 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>

            <button
              onClick={handleOpenAddModal}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add New Book
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Book Title & Author</th>
                  <th className="p-3.5">ISBN</th>
                  <th className="p-3.5">Genre</th>
                  <th className="p-3.5">Available Copies</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {filteredCatalogBooks.map((book) => (
                  <tr key={book._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={book.coverImage}
                          alt={book.title}
                          className="w-8 h-12 object-cover rounded bg-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-xs">{book.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{book.author} ({book.publicationYear})</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{book.ISBN}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {Array.isArray(book.genre) ? book.genre[0] : book.genre}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`font-semibold ${
                          book.availableCopies > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {book.availableCopies} / {book.totalCopies}
                      </span>
                    </td>
                    <td className="p-3.5 text-amber-400 font-semibold">
                      ★ {book.averageRating}
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(book)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                        title="Edit Book"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book._id, book.title)}
                        className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:text-rose-300 hover:bg-rose-900/50 transition-colors"
                        title="Delete Book"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: All Borrowing Activity Logs */}
      {activeTab === 'borrows' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Filter Status:</span>
            {['all', 'borrowed', 'returned'].map((status) => (
              <button
                key={status}
                onClick={() => setBorrowStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                  borrowStatusFilter === status
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Book Title</th>
                  <th className="p-3.5">Borrower</th>
                  <th className="p-3.5">Borrow Date</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Fine / Fee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {allBorrows
                  .filter((b) => borrowStatusFilter === 'all' || b.status === borrowStatusFilter)
                  .map((loan) => (
                    <tr key={loan._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-semibold text-white truncate max-w-xs">
                        {loan.book?.title}
                      </td>
                      <td className="p-3.5 text-slate-300">
                        {loan.user?.name} ({loan.user?.email})
                      </td>
                      <td className="p-3.5">{new Date(loan.borrowDate).toLocaleDateString()}</td>
                      <td className="p-3.5">{new Date(loan.dueDate).toLocaleDateString()}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            loan.status === 'borrowed'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono">
                        {loan.fine > 0 ? `$${loan.fine.toFixed(2)}` : '$0.00'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Registered Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Favorite Genres</th>
                  <th className="p-3.5 text-right">Role Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 flex items-center gap-2.5">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.name}`}
                        alt={u.name}
                        className="w-7 h-7 rounded-full bg-slate-800"
                      />
                      <span className="font-semibold text-white">{u.name}</span>
                    </td>
                    <td className="p-3.5 text-slate-400">{u.email}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {u.favoriteGenres?.join(', ') || 'None selected'}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleUserRole(u._id, u.role)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                      >
                        {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsBookModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {editingBook ? `Edit Book: ${editingBook.title}` : 'Add New Book to Catalog'}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Enter catalog details and copy counts for the book
            </p>

            <form onSubmit={handleSaveBook} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Book Title *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.title}
                    onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Author *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ISBN *</label>
                  <input
                    type="text"
                    required
                    value={bookForm.ISBN}
                    onChange={(e) => setBookForm({ ...bookForm, ISBN: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Genres (comma separated) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Programming, Computer Science, Engineering, Technology"
                    value={bookForm.genre}
                    onChange={(e) => setBookForm({ ...bookForm, genre: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Publication Year *</label>
                  <input
                    type="number"
                    required
                    value={bookForm.publicationYear}
                    onChange={(e) => setBookForm({ ...bookForm, publicationYear: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Copies Available *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bookForm.totalCopies}
                    onChange={(e) => setBookForm({ ...bookForm, totalCopies: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Publisher</label>
                  <input
                    type="text"
                    value={bookForm.publisher}
                    onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cover Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={bookForm.coverImage}
                    onChange={(e) => setBookForm({ ...bookForm, coverImage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Synopsis *</label>
                <textarea
                  rows={4}
                  required
                  value={bookForm.description}
                  onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tags / Keywords (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. artificial intelligence, future, cyberpunk"
                  value={bookForm.tags}
                  onChange={(e) => setBookForm({ ...bookForm, tags: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {editingBook ? 'Save Changes' : 'Create Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
