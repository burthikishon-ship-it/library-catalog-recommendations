import { Link } from 'react-router-dom';
import { BookOpen, Shield, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-850 mt-20 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-900">
          
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <BookOpen className="w-4 h-4 text-slate-950 font-bold" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                KIET <span className="text-brand-400">Central Library</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              KIET Group of Institutions • Academic Library Catalog & Content-Based Intelligent Book Recommendation System.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              KIET Library AI Engine Online
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Explore</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/catalog" className="hover:text-brand-400 transition-colors">Catalog Directory</Link></li>
              <li><Link to="/recommendations" className="hover:text-brand-400 transition-colors flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-400" /> Smart Picks</Link></li>
              <li><Link to="/catalog?sort=popularity" className="hover:text-brand-400 transition-colors">Popular Books</Link></li>
              <li><Link to="/catalog?availability=true" className="hover:text-brand-400 transition-colors">Available Right Now</Link></li>
            </ul>
          </div>

          {/* User Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Reader Services</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/dashboard" className="hover:text-brand-400 transition-colors">My Borrowed Loans</Link></li>
              <li><Link to="/profile" className="hover:text-brand-400 transition-colors">Reading Preferences</Link></li>
              <li><Link to="/login" className="hover:text-brand-400 transition-colors">Reader Portal</Link></li>
              <li><Link to="/admin" className="hover:text-brand-400 transition-colors flex items-center gap-1"><Shield className="w-3 h-3 text-amber-400" /> Staff Console</Link></li>
            </ul>
          </div>

          {/* Tech Stack Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Architecture</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Powered by React, Tailwind CSS, Node.js, Express, MongoDB, and high-performance TF-IDF cosine vector recommendation algorithms.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">React 18</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">Node / Express</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">MongoDB</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400">TF-IDF</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} KIET Central Library • Project by Lovely Kishon. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            KIET Group of Institutions • Full-Stack Web Application
          </p>
        </div>
      </div>
    </footer>
  );
}
