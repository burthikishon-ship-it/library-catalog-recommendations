import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Lock, Mail, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import KietLogo from '../components/KietLogo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      success('Welcome back to Athena Library!');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header with Official College Logo */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <KietLogo variant="hero" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sign In to KIET Central Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            KIET Group of Institutions • Student, Faculty & Staff Portal
          </p>
        </div>

        {/* 1-Click Quick Demo Login Bar */}
        <div className="glass-card rounded-2xl p-4 border border-brand-500/20 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300 block text-center">
            Instant Admin Login (Click to Autofill)
          </span>
          <button
            type="button"
            onClick={() => handleQuickFill('lovelykishon@gmail.com', '8341428657')}
            className="w-full p-2.5 rounded-xl bg-slate-900 border border-brand-500/50 hover:bg-brand-950/40 text-brand-300 text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-98 ring-1 ring-brand-500/40 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span>Lovely Kishon (Administrator)</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 text-xs sm:text-sm text-white rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 text-xs sm:text-sm text-white rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In to Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Register Redirect */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-brand-400 hover:underline font-semibold">
              Register for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
