import React, { useState } from 'react';
import { User, Mail, Shield, Lock, Sparkles, Check, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

const AVAILABLE_GENRES = [
  'Programming',
  'Computer Science',
  'Engineering',
  'Technology',
  'Mathematics',
  'Database',
  'Networking',
  'Cybersecurity',
  'Web Development',
  'Artificial Intelligence',
  'Science Fiction',
  'Philosophy',
  'Fiction',
  'Classics',
  'Mystery',
  'Psychology',
  'History',
  'Self-Help',
  'Biography',
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { success, error } = useNotification();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [favoriteGenres, setFavoriteGenres] = useState(user?.favoriteGenres || []);
  const [isUpdating, setIsUpdating] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const toggleGenre = (genre) => {
    if (favoriteGenres.includes(genre)) {
      setFavoriteGenres(favoriteGenres.filter((g) => g !== genre));
    } else {
      setFavoriteGenres([...favoriteGenres, genre]);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        favoriteGenres,
      });
      success('Profile and reading preferences updated!');
    } catch (err) {
      error(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      error('Please provide current and new password');
      return;
    }

    if (newPassword.length < 6) {
      error('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      error('New passwords do not match');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      if (res.success) {
        success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err) {
      error(err.message || 'Failed to change password');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 flex items-center gap-6">
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}`}
          alt={user?.name}
          className="w-20 h-20 rounded-2xl object-cover bg-slate-900 ring-2 ring-brand-500/40 shadow-xl"
        />
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight truncate">
            {user?.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            {user?.email}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/30">
              Role: {user?.role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Edit Profile & Genre Preferences */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-400" />
              Profile Details & Interests
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Update your display name, bio, and favorite genres to fine-tune your recommendations.
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-sm text-white rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Bio / Reading Goals
                </label>
                <textarea
                  rows={3}
                  placeholder="Share a short bio or what you love to read..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 text-sm text-white rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 resize-none"
                />
              </div>

              {/* Genre Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Favorite Genres (powers AI recommendation weighting)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_GENRES.map((g) => {
                    const isSelected = favoriteGenres.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleGenre(g)}
                        className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-brand-500 text-slate-950 font-bold shadow'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        <span>{g}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isUpdating ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Change Password */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-400" />
              Security & Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 chars"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPass}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isChangingPass ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
