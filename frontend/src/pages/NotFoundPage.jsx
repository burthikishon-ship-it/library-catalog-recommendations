import React from 'react';
import { Link } from 'react-router-dom';
import { BookX, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="glass-panel rounded-3xl p-10 max-w-md w-full border border-slate-800 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-brand-400 mb-5">
          <BookX className="w-8 h-8" />
        </div>
        <span className="text-4xl font-extrabold text-white">404</span>
        <h1 className="text-xl font-bold text-slate-200 mt-2">Page Not Found</h1>
        <p className="text-xs text-slate-400 mt-2 mb-6">
          The catalog shelf you're looking for seems to have been misplaced or archived.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home Page
          </Link>
          <Link
            to="/catalog"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-800 transition-colors"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
